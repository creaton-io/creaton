// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./CreatorProxy.sol";
import "./CreatorV1.sol";
import "../metatx/CreatonPaymaster.sol";
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

contract CreatonAdmin is ICreatonAdmin, UUPSUpgradeable, Initializable, BaseRelayRecipient {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string description, uint256 subscriptionPrice);
    event NewSubscriber(address user, uint256 amount);
    event ProfileUpdate(address user, string jsonData);

    // -----------------------------------------
    // Storage
    // -----------------------------------------
    address owner;

    mapping(address => address[]) public creator2contract;
    mapping(address => address) public contract2creator;
    mapping(address => bool) public override registeredUsers;
    mapping(address => string) public user2twitter;

    address private _host;
    address private _cfa;
    address private _acceptedToken;

    ISuperfluid public superFluid;

    address public override treasury;
    int96 public override treasuryFee;

    address public creatorBeacon;
    address public override nftFactory;

    address payable public paymaster;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    function initialize(
        address host,
        address cfa,
        address acceptedToken, // get these from superfluid contracts
        address _treasury,
        int96 _treasuryFee,
        address _creatorBeacon,
        address _nftFactory,
        address _trustedForwarder,
        address payable _paymaster
    ) public payable initializer {
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
        paymaster = _paymaster;
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
        //require(registeredUsers[_msgSender()], "You need to signup on Creaton before becoming a creator"); //can use Ceramic for profiles in the future
        CreatorV1 creatorContract =
            new CreatorV1(
                _host,
                _cfa,
                _acceptedToken,
                _msgSender(),
                description,
                subscriptionPrice,
                nftName,
                nftSymbol
            );

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;

        address creatorContractAddr = address(creatorContract);
        require(creatorContractAddr != address(0));

        superFluid.registerAppByFactory(ISuperApp(creatorContractAddr), configWord);

        contract2creator[creatorContractAddr] = _msgSender();
        creator2contract[_msgSender()].push(creatorContractAddr);
        CreatonPaymaster(paymaster).addCreatorContract(creatorContractAddr);

        //IERC20(_acceptedToken).transfer(creatorContractAddr, 1e16); not necessary anymore?

        emit CreatorDeployed(_msgSender(), creatorContractAddr, description, subscriptionPrice);
    }

    // TODO only be called from twitter contract
    function signUp(address user, string memory twitter) public {
        user2twitter[user] = twitter;
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

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function updateTrustedForwarder(address _trustedForwarder) public onlyOwner {
        trustedForwarder = _trustedForwarder;
    }

    /* ========== MODIFIERS ========== */

    modifier onlyOwner() {
        require(msg.sender == owner, "CreatonAdmin: Caller is not owner");
        _;
    }
}
