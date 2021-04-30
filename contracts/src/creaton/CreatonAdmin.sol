// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
pragma abicoder v2;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./CreatorProxy.sol";
import "../metatx/CreatonPaymaster.sol";
import "../dependency/gsn/contracts/BaseRelayRecipient.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract CreatonAdmin is BaseRelayRecipient {
    
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string description, uint256 subscriptionPrice);
    event NewSubscriber(address user, uint256 amount);
    event ProfileUpdate(address user, string jsonData);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => address[]) public creator2contract; 
    mapping(address => address) public contract2creator;
    mapping(address => bool) public registered_users;
    mapping(address => string) public user2twitter;

    address private _host;
    address private _cfa;
    address private _acceptedToken;

    address public treasury;
    int96 public treasury_fee;

    address public creatorBeacon;
    address public nftFactory;

    address payable public paymaster;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor(
        address host,
        address cfa,
        address acceptedToken, // get these from superfluid contracts
        address _treasury,
        int96 _treasury_fee,
        address _creatorBeacon,
        address _nftFactory,
        address _trustedForwarder,
        address payable _paymaster
    ) {
        assert(host != address(0));
        assert(cfa != address(0));
        assert(acceptedToken != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        treasury = _treasury;
        treasury_fee = _treasury_fee;

        creatorBeacon = _creatorBeacon;
        nftFactory = _nftFactory;

        trustedForwarder = _trustedForwarder;
        paymaster = _paymaster;
    }

    // -----------------------------------------
    // Logic 
    // -----------------------------------------

    function deployCreator(string calldata description, uint256 subscriptionPrice,
        string memory nftName, string memory nftSymbol) external {
        require(registered_users[_msgSender()], "You need to signup in Creaton before becoming a creator");
        CreatorProxy creatorContract =
        new CreatorProxy(
            creatorBeacon,
            abi.encodeWithSignature("initialize(address,address,address,address,string,uint256,address,string,string)",
            _host, _cfa, _acceptedToken, _msgSender(), description, subscriptionPrice, trustedForwarder, nftName, nftSymbol)
        );

        address creatorContractAddr = address(creatorContract);
        require(creatorContractAddr != address(0));

        contract2creator[creatorContractAddr] = _msgSender();
        creator2contract[_msgSender()].push(creatorContractAddr);
        CreatonPaymaster(paymaster).addCreatorContract(creatorContractAddr);

        IERC20(_acceptedToken).transfer(creatorContractAddr, 1e16);

        emit CreatorDeployed(_msgSender(), creatorContractAddr, description, subscriptionPrice);
    }

    // TODO only be called from twitter contract
    function signUp (address user, string memory twitter) public {
        user2twitter[user] = twitter;
    }

    function updateProfile(string memory dataJSON) external {
        registered_users[_msgSender()] = true;
        emit ProfileUpdate(_msgSender(), dataJSON);
    }

    function versionRecipient() external view override  returns (string memory){
        return "2.1.0";
    }
    
}
