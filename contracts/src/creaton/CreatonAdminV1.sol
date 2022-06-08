// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./CreatorProxy.sol";
import "./CreatorV1.sol";
import "../dependency/gsn/BaseRelayRecipient.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "./ICreatonAdmin.sol";
import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    SuperAppDefinitions,
    ISuperApp
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { IUnlock, IPublicLock } from "./unlock/IUnlock.sol";

contract CreatonAdmin is ICreatonAdmin, Initializable, BaseRelayRecipient {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string description, uint256 subscriptionPrice, address unlock);
    event NewSubscriber(address user, uint256 amount);
    event ProfileUpdate(address user, string jsonData);

    // -----------------------------------------
    // Storage
    // -----------------------------------------
    address owner;

    mapping(address => address[]) public creator2contract;
    mapping(address => address) public contract2creator;
    mapping(address => bool) public override registeredUsers;

    address private _host;
    address private _cfa;
    address private _acceptedToken;
    int96 private _MINIMUM_FLOW_RATE;

    ISuperfluid public superFluid;

    address public override treasury;
    int96 public override treasuryFee;

    address public creatorBeacon;
    address public override nftFactory;

    IUnlock unlockProtocol;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor(
        address host,
        address cfa,
        address acceptedToken, // get these from superfluid contracts
        address _treasury,
        int96 _treasuryFee,
        address _creatorBeacon,
        address _nftFactory,
        address _trustedForwarder
    ) {
        owner = msg.sender;

        assert(host != address(0));
        assert(cfa != address(0));
        assert(acceptedToken != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        superFluid = ISuperfluid(_host);

        treasury = _treasury;
        treasuryFee = _treasuryFee;
        creatorBeacon = _creatorBeacon;
        nftFactory = _nftFactory;

        trustedForwarder = _trustedForwarder;
    }

    // -----------------------------------------
    // Logic
    // -----------------------------------------

    function deployCreator(
        string calldata description,
        uint256 subscriptionPrice,
        string memory nftName,
        string memory nftSymbol
    ) external {
        unlockProtocol = IUnlock(0x1FF7e338d5E582138C46044dc238543Ce555C963); //Mumbai
        uint256 version = unlockProtocol.unlockVersion();
        bytes12 salt = bytes12(keccak256(abi.encodePacked(_MINIMUM_FLOW_RATE, _acceptedToken)));
        IPublicLock lock = IPublicLock(unlockProtocol.createLock(315360000, _acceptedToken, 0, 10000000, nftName, salt));
        lock.addLockManager(_msgSender());
        lock.addKeyGranter(_msgSender());
        //lock.setBaseTokenURI("https://api.backer.vip/keys/");
        lock.updateLockSymbol(nftSymbol); // TODO: change?

        CreatorProxy creatorContract =
            new CreatorProxy(
                creatorBeacon,
                abi.encodeWithSignature(
                    "initialize(address,address,address,address,string,uint256,string,string,address,address)",
                    _host,
                    _cfa,
                    _acceptedToken,
                    _msgSender(),
                    description,
                    subscriptionPrice,
                    nftName,
                    nftSymbol,
                    trustedForwarder,
                    address(lock)
                )
            );

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;

        address creatorContractAddr = address(creatorContract);
        require(creatorContractAddr != address(0));

        //superFluid.registerAppByFactory(ISuperApp(creatorContractAddr), configWord);

        contract2creator[creatorContractAddr] = _msgSender();
        creator2contract[_msgSender()].push(creatorContractAddr);

        //IERC20(_acceptedToken).transfer(creatorContractAddr, 1e16); not necessary anymore?

        _MINIMUM_FLOW_RATE = (int96(uint96(subscriptionPrice)) * 1e18) / (3600 * 24 * 30);
        
        emit CreatorDeployed(_msgSender(), creatorContractAddr, description, subscriptionPrice, address(lock));
    }

    function updateProfile(string memory dataJSON) external {
        registeredUsers[_msgSender()] = true;
        emit ProfileUpdate(_msgSender(), dataJSON);
    }

    /* ========== VIEW FUNCTIONS ========== */

    function getTrustedForwarder() public view override returns (address) {
        return trustedForwarder;
    }

    function versionRecipient() external view override returns (string memory) {
        return "2.2.3-matic";
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    //function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function updateTrustedForwarder(address _trustedForwarder) public onlyOwner {
        trustedForwarder = _trustedForwarder;
    }

    /* ========== MODIFIERS ========== */

    modifier onlyOwner() {
        require(msg.sender == owner, "CreatonAdmin: Caller is not owner");
        _;
    }
}
