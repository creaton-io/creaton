// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./ICreatonAdmin.sol";
import "./NFTFactory.sol";
import "./Post.sol";
import "../dependency/gsn/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import { IUnlock, IPublicLock } from "./unlock/IUnlock.sol";

contract CreatorV1 is SuperAppBase, Initializable, BaseRelayRecipient {
    // -----------------------------------------
    // Errors
    // -----------------------------------------

    string private constant _ERR_STR_LOW_FLOW_RATE = "Superfluid: flow rate not enough";
    string private constant _ERR_STR_NO_UPFRONT = "Creaton: pay monthly amount upfront first";

    // -----------------------------------------
    // Structures
    // -----------------------------------------

    enum Status {unSubscribed, subscribed}
    enum Type {free, encrypted}

    event SubscriberEvent(address user, Status status);
    event NewPost(uint256 tokenId, string jsonData, Type contentType);
    event PostContract(address nftContract);
    event HidePost(uint256 tokenId, bool hide);

    struct Subscriber {
        Status status;
    }

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    address public admin;
    address public creator;
    ICreatonAdmin adminContract;
    NFTFactory nftFactory;
    IUnlock unlockProtocol;
    address public unlockLock;

    string public description;
    int96 public subscriptionPrice;
    int96 private _MINIMUM_FLOW_RATE;
    mapping(address => Subscriber) public subscribers;
    uint256 subscriberCount; // subscribers in subscribed/pendingSubscribe state
    address public postNFT;
    mapping(uint256 => Type) post2tier;
    uint256 uIntSubscriptionPrice;
    mapping(address => bool) public payedUpfront;

    // -----------------------------------------
    // Initializer
    // -----------------------------------------

    function initialize(
        address host,
        address cfa,
        address acceptedToken,
        address _creator,
        string memory _description,
        uint256 _subscriptionPrice,
        string memory nftName,
        string memory nftSymbol,
        address _trustedForwarder,
        address unlockLock
    ) public payable initializer {
        admin = _msgSender();

        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));

        _host = ISuperfluid(host);
        _cfa = IConstantFlowAgreementV1(cfa);
        _acceptedToken = ISuperToken(acceptedToken);
        trustedForwarder = _trustedForwarder;
        //uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
        //_host.registerApp(configWord);

        creator = _creator;
        description = _description;
        uIntSubscriptionPrice = _subscriptionPrice * 1e18;
        subscriptionPrice = int96(uint96(_subscriptionPrice));
        _MINIMUM_FLOW_RATE = (subscriptionPrice * 1e18) / (3600 * 24 * 30);

        adminContract = ICreatonAdmin(admin);
        nftFactory = NFTFactory(adminContract.nftFactory());
        createPostNFT(nftName, nftSymbol);

        unlockLock = unlockLock;
        // TODO: config the lock: symbol, image, callbacks, etc. -- need Lock interface
        //Tier memory tier = Tier(address(lock), flowRate, token, multiplier, name, metadata, true);

        //Creator subscribes to themselves
        _addSubscriber(creator);
        grantKeys(creator);
    }

    // -----------------------------------------
    // Logic
    // -----------------------------------------

    receive() external payable {}

    function withdrawEth() public onlyCreator {
        (bool success, ) = _msgSender().call{value: (address(this).balance)}("Not admin");
        require(success, "No balance");
    }

    function recoverTokens(address _token) external onlyCreator {
        IERC20(_token).approve(address(this), 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        IERC20(_token).transfer(_msgSender(), IERC20(_token).balanceOf(address(this)));
    }

    function changeStatus(address _address, Status status) private {
        subscribers[_address].status = status;
        emit SubscriberEvent(_address, status);
    }

    function getSubscriberCount() public view returns (uint256) {
        return subscriberCount;
    }

    function createPostNFT(string memory name, string memory symbol) internal {
        require(postNFT == address(0));
        postNFT = nftFactory.createPostNFT(name, symbol, "", address(this));
        emit PostContract(postNFT);
    }

    function upload(
        string memory _metadataURI,
        string memory _dataJSON,
        Type contentType
    ) external onlyCreator {
        require(postNFT != address(0));
        require(contentType == Type.free || contentType == Type.encrypted);
        uint256 tokenId = Post(postNFT).mint(creator, _metadataURI);
        post2tier[tokenId] = contentType;
        emit NewPost(tokenId, _dataJSON, contentType);
    }

    function hidePost(uint256 tokenId, bool hide) external onlyCreator {
        emit HidePost(tokenId, hide);
    }

    // -----------------------------------------
    // utility
    // -----------------------------------------

    function percentage(int96 num, int96 percent) public pure returns (int96) {
        return (num * percent) / 100;
    }

    function versionRecipient() external view virtual override returns (string memory) {
        return "2.2.3-matic";
    }

    function isTrustedForwarderAdmin(address forwarder) public view returns (bool) {
        return forwarder == adminContract.getTrustedForwarder();
    }

    function updateTrustedForwarder(address _trustedForwarder) public onlyCreator {
        trustedForwarder = _trustedForwarder;
    }

    /// @dev Take entrance fee from the user and issue a ticket
    function upfrontFee(bytes calldata ctx) external onlyHost returns (bytes memory newCtx) {
        // msg sender is encoded in the Context
        address sender = _host.decodeCtx(ctx).msgSender;
        _acceptedToken.transferFrom(sender, creator, uIntSubscriptionPrice);
        payedUpfront[sender] = true;
        return ctx;
    }

    // -----------------------------------------
    // Superfluid Logic
    // -----------------------------------------

    function _openFlows(
        bytes calldata ctx,
        int96 contract2creator,
        int96 contract2treasury
    ) private returns (bytes memory newCtx) {
        // open flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.createFlow.selector, _acceptedToken, creator, contract2creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // open flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                adminContract.treasury(),
                contract2treasury,
                new bytes(0)
            ),
            new bytes(0),
            newCtx
        );
    }

    function _updateFlows(
        bytes calldata ctx,
        int96 contract2creator,
        int96 contract2treasury
    ) private returns (bytes memory newCtx) {
        // update flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.updateFlow.selector, _acceptedToken, creator, contract2creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // update flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                adminContract.treasury(),
                contract2treasury,
                new bytes(0)
            ), // call data
            new bytes(0), // user data
            newCtx // ctx
        );
    }

    function _deleteFlows(bytes calldata ctx) private returns (bytes memory newCtx) {
        // delete flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.deleteFlow.selector, _acceptedToken, address(this), creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // delete flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                address(this),
                adminContract.treasury(),
                new bytes(0)
            ), // call data
            new bytes(0), // user data
            newCtx // ctx
        );
    }

    function _addSubscriber(address _address) private {
        subscriberCount += 1;
        changeStatus(_address, Status.subscribed);
    }

    function _delSubscriber(address _address) private {
        subscriberCount -= 1;
        changeStatus(_address, Status.unSubscribed);
        delete subscribers[_address];
    }

    function _subscribe(
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) private returns (bytes memory newCtx) {
        (, int96 flowRate, , ) = IConstantFlowAgreementV1(agreementClass).getFlowByID(_acceptedToken, agreementId);
        require(flowRate >= _MINIMUM_FLOW_RATE, _ERR_STR_LOW_FLOW_RATE);
        ISuperfluid.Context memory context = _host.decodeCtx(ctx); // should give userData
        require(payedUpfront[context.msgSender] == true, _ERR_STR_NO_UPFRONT);

        int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
        int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasuryFee());
        int96 contract2treasuryDelta = contractFlowRate - contract2creatorDelta;

        //Grant Unlock NFT and key to subscriber
        grantKeys(context.msgSender);

        if (subscriberCount == 1) {
            //creator are subscribed to themselves already
            newCtx = _openFlows(ctx, contract2creatorDelta, contract2treasuryDelta);
        } else if (subscriberCount > 1) {
            (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
            (, int96 contract2treasuryCurrent, , ) =
                _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());
            newCtx = _updateFlows(
                ctx,
                contract2creatorCurrent + contract2creatorDelta,
                contract2treasuryCurrent + contract2treasuryDelta
            );
        }

        payedUpfront[context.msgSender] = false;

        _addSubscriber(context.msgSender);
    }

    function _updateSubscribe(
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) private returns (bytes memory newCtx) {
        (, int96 flowRate, , ) = IConstantFlowAgreementV1(agreementClass).getFlowByID(_acceptedToken, agreementId);
        require(flowRate >= _MINIMUM_FLOW_RATE, _ERR_STR_LOW_FLOW_RATE);

        int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
        int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasuryFee());
        int96 contract2treasuryDelta = contractFlowRate - contract2creatorDelta;

        (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
        (, int96 contract2treasuryCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());
        newCtx = _updateFlows(
            ctx,
            contract2creatorCurrent + contract2creatorDelta,
            contract2treasuryCurrent + contract2treasuryDelta
        );
    }

    function _unsubscribe(bytes calldata ctx) private returns (bytes memory newCtx) {
        address sender = _host.decodeCtx(ctx).msgSender;

        //delete Unlock NFT key (Unlock NFT do not get burned)
        IPublicLock lock = IPublicLock(unlockLock);
        if (lock.getHasValidKey(sender)) {
            lock.expireAndRefundFor(sender, 0);
        }

        _delSubscriber(sender);
        
        if (subscriberCount == 1) {
            newCtx = _deleteFlows(ctx);
        } else if (subscriberCount > 0) {
            int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
            int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasuryFee());
            int96 contract2treasuryDelta = contractFlowRate - contract2creatorDelta;

            (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
            (, int96 contract2treasuryCurrent, , ) =
                _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());

            newCtx = _updateFlows(
                ctx,
                contract2creatorCurrent + contract2creatorDelta,
                contract2treasuryCurrent + contract2treasuryDelta
            );
        }
    }

    function grantKeys(address msgSender) internal {
        IPublicLock lock = IPublicLock(unlockLock);
        address[] memory _recipients = new address[](1);
        uint[] memory _expirationTimestamps = new uint[](1);
        address[] memory _keyManagers = new address[](1);
        _recipients[0] = msgSender;
        _expirationTimestamps[0] = 2236879077;
        _keyManagers[0] = address(this);
        //bool isManager = lock.isLockManager(address(this));
        //bool isGranter = lock.isKeyGranter(address(this));
        lock.grantKeys(_recipients, _expirationTimestamps, _keyManagers);
    }

    // -----------------------------------------
    // Superfluid Callbacks
    // -----------------------------------------

    function beforeAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32, /*agreementId*/
        bytes calldata, /*agreementData*/
        bytes calldata ctx
    ) external view override onlyHost onlyExpected(superToken, agreementClass) returns (bytes memory cbdata) {
        cbdata = new bytes(0);
    }

    function afterAgreementCreated(
        ISuperToken, /* superToken */
        address agreementClass,
        bytes32 agreementId,
        bytes calldata, /*agreementData*/
        bytes calldata cbdata,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        return _subscribe(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementUpdated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata, /*agreementData*/
        bytes calldata /*ctx*/
    ) external view override onlyHost onlyExpected(superToken, agreementClass) returns (bytes memory cbdata) {
        cbdata = new bytes(0);
    }

    function afterAgreementUpdated(
        ISuperToken, /* superToken */
        address agreementClass,
        bytes32 agreementId,
        bytes calldata, /*agreementData*/
        bytes calldata cbdata,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        return _updateSubscribe(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32, /*agreementId*/
        bytes calldata, /*agreementData*/
        bytes calldata /*ctx*/
    ) external view override onlyHost returns (bytes memory cbdata) {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(superToken) || !_isCFAv1(agreementClass)) return abi.encode(true);
        return abi.encode(false);
    }

    function afterAgreementTerminated(
        ISuperToken, /* superToken */
        address, /* agreementClass */
        bytes32, /* agreementId */
        bytes calldata, /*agreementData*/
        bytes calldata cbdata,
        bytes calldata ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        // According to the app basic law, we should never revert in a termination callback
        bool shouldIgnore = abi.decode(cbdata, (bool));
        if (shouldIgnore) return ctx;
        return _unsubscribe(ctx);
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    // -----------------------------------------
    // Modifiers
    // -----------------------------------------

    modifier onlyHost() {
        require(_msgSender() == address(_host), "CreatonSuperApp: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "CreatonSuperApp: not accepted token");
        require(_isCFAv1(agreementClass), "CreatonSuperApp: only CFAv1 supported");
        _;
    }

    modifier onlyCreator() {
        require(_msgSender() == creator, "Not the creator");
        _;
    }
}
