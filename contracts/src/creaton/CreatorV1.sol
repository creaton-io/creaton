// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;
//this handles all streaming for the Creators
import "./ICreatonAdmin.sol";
import "./NFTFactory.sol";
import "./Post.sol";
import "../dependency/gsn/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import "./CreatorToken.sol";
import "./CreatorStreamingV1.sol";

contract CreatorV1 is SuperAppBase, Initializable, BaseRelayRecipient {
    // -----------------------------------------
    // Errors
    // -----------------------------------------

    // string private constant _ERR_STR_LOW_FLOW_RATE = "Superfluid: flow rate not enough";
    // string private constant _ERR_STR_NO_UPFRONT = "Creaton: pay monthly amount upfront first";

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
    // IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    address public admin;
    address public creator;
    ICreatonAdmin adminContract;
    NFTFactory nftFactory;

    string public description;
    int96 public subscriptionPrice;
    mapping(address => Subscriber) public subscribers;
    uint256 subscriberCount; // subscribers in subscribed/pendingSubscribe state
    address public postNFT;
    mapping(uint256 => Type) post2tier;

    CreatorStreamingV1 streamingContract;

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
        CreatorStreamingV1 _streamingContract
    ) public payable initializer {
        admin = msg.sender;

        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));

        trustedForwarder = _trustedForwarder;
        //uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
        //_host.registerApp(configWord);

        creator = _creator;
        description = _description;

        adminContract = ICreatonAdmin(admin);
        nftFactory = NFTFactory(adminContract.nftFactory());
        createPostNFT(nftName, nftSymbol);
        streamingContract = _streamingContract;//actual contract to handle the MONEY!
        _addSubscriber(creator);
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
        //approve and transfer all tokens from this contract to the creator
        IERC20(_token).approve(address(this), 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        IERC20(_token).transfer(_msgSender(), IERC20(_token).balanceOf(address(this)));
        streamingContract.recoverTokens(_token, _msgSender());
    }

    function changeStatus(address _address, Status status) private {
        //internal function to change the status of a subscriber
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
    function upfrontFee(bytes calldata ctx) external onlyHost returns (bytes memory) {
        // msg sender is encoded in the Context
        //i think this patch changes all the streaming to be a different contract
        return streamingContract.upfrontFee(ctx);
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

    // -----------------------------------------
    // Modifiers
    // -----------------------------------------

    modifier onlyHost() {
        require(msg.sender == address(_host), "CreatonSuperApp: support only one host");
        _;
    }

    modifier onlyCreator() {
        require(_msgSender() == creator, "Not the creator");
        _;
    }
}
