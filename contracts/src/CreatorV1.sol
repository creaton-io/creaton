// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
pragma abicoder v2;

import './CreatonAdmin.sol';
import './NFTFactory.sol';
import './Post.sol';
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";


import { Int96SafeMath } from "./utils/Int96SafeMath.sol";



contract CreatorV1 is SuperAppBase, Initializable {
    using Int96SafeMath for int96;
    // -----------------------------------------
    // Errors
    // -----------------------------------------

    string private constant _ERR_STR_LOW_FLOW_RATE = "Superfluid: flow rate not enough";

    // -----------------------------------------
    // Structures
    // -----------------------------------------

    enum Status { unSubscribed, pendingSubscribe, pendingUnsubscribe, subscribed }
    enum Approval { neutral, like, dislike }

    event SubscriberEvent(address user, string sigKey, string pubKey, Status status);
    event Like(address user, uint256 tokenId, Approval approval);
    event NewPost(uint256 tokenId, string jsonData, uint8 tier);
    event PostContract(address nftContract);

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
    CreatonAdmin adminContract;
    NFTFactory nftFactory;

    string public description;
    int96 public subscriptionPrice;
    int96 private _MINIMUM_FLOW_RATE;
    mapping (address => Subscriber) public subscribers;
    uint256 subscriberCount; // subscribers in subscribed/pendingSubscribe state
    address public postNFT;
    mapping (uint256 => uint8) post2tier;

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
        address nftFactoryAddress
    ) public payable initializer {
        admin = msg.sender;

        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));

        _host = ISuperfluid(host);
        _cfa = IConstantFlowAgreementV1(cfa);
        _acceptedToken = ISuperToken(acceptedToken);

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
        _host.registerApp(configWord);

        creator = _creator;
        description = _description;
        subscriptionPrice = int96(uint96(_subscriptionPrice));
        _MINIMUM_FLOW_RATE = subscriptionPrice.mul(1e18).div(3600 * 24 * 30);
        adminContract = CreatonAdmin(admin);
        nftFactory = NFTFactory(nftFactoryAddress);
        subscriberCount = 0;
    }

    // -----------------------------------------
    // Logic
    // -----------------------------------------

    receive() external payable {}

    function withdrawEth() public {
        (bool success, ) = msg.sender.call{value: (address(this).balance)}("Not admin");
        require(success, "No balance");
    }

    // function recoverTokens(address _token) external isCreator {
    //     ERC20(_token).approve(address(this), 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
    //     ERC20(_token).transfer(msg.sender, ERC20(_token).balanceOf(address(this)));
    // }

    function changeStatus(address _address, Status status) private {
        subscribers[_address].status = status;
        emit SubscriberEvent(_address, "", "", status);
    }

    function acceptSubscribe(address _address) external  {
        require(subscribers[_address].status == Status.pendingSubscribe, "Not pending subscribe");
        changeStatus(_address, Status.subscribed);
    }

    function acceptUnsubscribe(address _address) external  {
        require(subscribers[_address].status == Status.pendingUnsubscribe, "Not pending unsubscribe");
        changeStatus(_address, Status.unSubscribed);
        delete subscribers[_address];
    }

    function bulkAcceptSubscribe(address[] memory _addresses) external  {
        for(uint i = 0; i < _addresses.length; i++) {
            changeStatus(_addresses[i], Status.subscribed);
        }
    }

    function bulkAcceptUnsubscribe(address[] memory _addresses) external  {
        for(uint i = 0; i < _addresses.length; i++) {
            changeStatus(_addresses[i], Status.unSubscribed);
            delete subscribers[_addresses[i]];
        }
    }

    function getSubscriberCount() public view returns (uint256) {
        return subscriberCount;
    }

    // TODO check tokenId is minted (exists)
    function like(uint _tokenId, uint approvalEnum) external {
        address _address = msg.sender;
        if (post2tier[_tokenId] > 0){
            require(subscribers[_address].status == Status.subscribed, "Not subscribed");
        }
        require(approvalEnum < 3 && approvalEnum >= 0, "Invalid approval enum");
        Approval approval = Approval(approvalEnum);
        emit Like(_address, _tokenId, approval);
    }

    // TODO only once
    // TODO check comes from admin
    // TODO check is the creator
    // TODO unique name/symbol per creator?
    function createTier(string memory name, string memory symbol) public {
        postNFT = nftFactory.createPostNFT(name, symbol, "", address(this));
        emit PostContract(postNFT);
    }

    function upload(string memory _metadataURI, string memory _dataJSON, uint8 tier) external {
        uint256 tokenId = Post(postNFT).mint(creator, _metadataURI);
        post2tier[tokenId] = tier;
        emit NewPost(tokenId, _dataJSON, tier);
    }

    // -----------------------------------------
    // utility
    // -----------------------------------------

    function percentage (
        int96 num,
        int96 percent
    ) public pure returns (int96) {
        return num.mul(percent).div(100);
    }

    // -----------------------------------------
    // Superfluid Logic
    // -----------------------------------------

    function _openFlows(
        bytes calldata ctx,
        int96 contract2creator, 
        int96 contract2treasury
    ) private returns (bytes memory newCtx){
        // open flow to creator
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    _acceptedToken,
                    creator,
                    contract2creator,
                    new bytes(0)
                ),
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
    ) private returns (bytes memory newCtx){
        // update flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                creator,
                contract2creator,
                new bytes(0)
            ),
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

    function _deleteFlows(
        bytes calldata ctx
    ) private returns (bytes memory newCtx) {
        // delete flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                address(this),
                creator,
                new bytes(0)
            ),
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

    function _addSubscriber(address _address, string memory _sigKey, string memory _pubKey) private {
        subscriberCount += 1;
        subscribers[_address] = Subscriber(Status.pendingSubscribe);
        emit SubscriberEvent(_address, _sigKey, _pubKey, Status.pendingSubscribe);
    }

    function _delSubscriber(address _address) private {
        if(subscribers[_address].status == Status.subscribed){
            changeStatus(_address, Status.pendingUnsubscribe);
        }
        if(subscribers[_address].status == Status.pendingSubscribe){
            changeStatus(_address, Status.unSubscribed);
            delete subscribers[_address];
        }
        subscriberCount -= 1;
    }

    function _subscribe (
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) private returns (bytes memory newCtx){

        (, int96 flowRate, , ) = IConstantFlowAgreementV1(agreementClass).getFlowByID(_acceptedToken, agreementId);
        require(flowRate >= _MINIMUM_FLOW_RATE, _ERR_STR_LOW_FLOW_RATE);

        ISuperfluid.Context memory context = _host.decodeCtx(ctx); // should give userData

        int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
        int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasury_fee());
        int96 contract2treasuryDelta = contractFlowRate.sub(contract2creatorDelta);

        if (subscriberCount == 0){
            newCtx = _openFlows(ctx, contract2creatorDelta, contract2treasuryDelta);
        } else if (subscriberCount > 0){
            (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
            (, int96 contract2treasuryCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());
            newCtx = _updateFlows(ctx,
                                contract2creatorCurrent + contract2creatorDelta, 
                                contract2treasuryCurrent + contract2treasuryDelta
                                );
        }

        (string memory sigKey, string memory pubKey) = abi.decode(context.userData, (string, string)); 
        _addSubscriber(context.msgSender, sigKey, pubKey);
    }

    function _updateSubscribe(
        bytes calldata ctx,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata cbdata
    ) private returns (bytes memory newCtx){

        (, int96 flowRate, , ) = IConstantFlowAgreementV1(agreementClass).getFlowByID(_acceptedToken, agreementId);
        require(flowRate >= _MINIMUM_FLOW_RATE, _ERR_STR_LOW_FLOW_RATE);

        int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
        int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasury_fee());
        int96 contract2treasuryDelta = contractFlowRate.sub(contract2creatorDelta);

        (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
        (, int96 contract2treasuryCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());
        newCtx = _updateFlows(ctx,
                              contract2creatorCurrent + contract2creatorDelta, 
                              contract2treasuryCurrent + contract2treasuryDelta
                             );
    }

    function _unsubscribe (
        bytes calldata ctx
    ) private returns (bytes memory newCtx){
        address sender = _host.decodeCtx(ctx).msgSender;

        if (subscriberCount == 1){
            newCtx = _deleteFlows(ctx);
        } else if (subscriberCount > 0){
            int96 contractFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));
            int96 contract2creatorDelta = percentage(contractFlowRate, adminContract.treasury_fee());
            int96 contract2treasuryDelta = contractFlowRate.sub(contract2creatorDelta);

            (, int96 contract2creatorCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), creator);
            (, int96 contract2treasuryCurrent, , ) = _cfa.getFlow(_acceptedToken, address(this), adminContract.treasury());

            newCtx = _updateFlows(ctx,
                                  contract2creatorCurrent + contract2creatorDelta, 
                                  contract2treasuryCurrent + contract2treasuryDelta
                                 );
        }

        _delSubscriber(sender);
    }

    // -----------------------------------------
    // Superfluid Callbacks
    // -----------------------------------------

    function beforeAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    )
        external view override
        onlyHost
        onlyExpected(superToken, agreementClass)
        returns (bytes memory cbdata)
    {
        cbdata = new bytes(0);
    }

    function afterAgreementCreated(
        ISuperToken /* superToken */,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*agreementData*/,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        return _subscribe(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementUpdated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*agreementData*/,
        bytes calldata /*ctx*/
    )
        external view override
        onlyHost
        onlyExpected(superToken, agreementClass)
        returns (bytes memory cbdata)
    {
        cbdata = new bytes(0);
    }

    function afterAgreementUpdated(
        ISuperToken /* superToken */,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*agreementData*/,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        return _updateSubscribe(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata /*ctx*/
    )
        external view override
        onlyHost
        returns (bytes memory cbdata)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(superToken) || !_isCFAv1(agreementClass)) return abi.encode(true);
        return abi.encode(false);
    }

    function afterAgreementTerminated(
        ISuperToken /* superToken */,
        address /* agreementClass */,
        bytes32 /* agreementId */,
        bytes calldata /*agreementData*/,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        // According to the app basic law, we should never revert in a termination callback
        (bool shouldIgnore) = abi.decode(cbdata, (bool));
        if (shouldIgnore) return ctx;
        return _unsubscribe(ctx);
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    // -----------------------------------------
    // Modifiers
    // -----------------------------------------

    modifier onlyHost() {
        require(msg.sender == address(_host), "LotterySuperApp: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "LotterySuperApp: not accepted token");
        require(_isCFAv1(agreementClass), "LotterySuperApp: only CFAv1 supported");
        _;
    }

    modifier isCreator() {
        require(msg.sender == creator, "Not owner");
        _;
    }

}
