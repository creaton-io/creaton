pragma solidity 0.7.1;
pragma abicoder v2;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./utils/SafeMath.sol";
import "hardhat/console.sol";
import "./Creator.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract CreatonAdmin is Ownable, SuperAppBase{
    using EnumerableSet for EnumerableSet.AddressSet;
    
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string metadataURL, uint256 subscriptionPrice);
    event NewSubscriber(address user, uint256 amount);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => EnumerableSet.AddressSet) public creator2contract; // this could go wrong cause of the set
    mapping(address => address) public contract2creator;

    address private _host;
    address private _cfa;
    address private _acceptedToken;

    address public treasury;
    int96 treasury_fee;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor(
        address host,
        address cfa,
        address acceptedToken, // get these from superfluid contracts
        address _treasury,
        int96 _treasury_fee
    ) {
        assert(host != address(0));
        assert(cfa != address(0));
        assert(acceptedToken != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        treasury = _treasury;
        treasury_fee = _treasury_fee;

    }

    // -----------------------------------------
    // Logic 
    // -----------------------------------------

    function deployCreator(string calldata metadataURL, uint256 subscriptionPrice) external {
        Creator creatorContract =
            new Creator(
                ISuperfluid(_host),
                IConstantFlowAgreementV1(_cfa),
                ISuperToken(_acceptedToken)
            ); 
        creatorContract.init(msg.sender, metadataURL, subscriptionPrice, treasury, treasury_fee);
        //  TODO do nott pass this, get treasury address and fee from CreatonAdmin

        address creatorContractAddr = address(creatorContract);
        contract2creator[creatorContractAddr] = msg.sender;
        creator2contract[msg.sender].add(creatorContractAddr);

        emit CreatorDeployed(msg.sender, creatorContractAddr, metadataURL, subscriptionPrice);
    }
    
}
