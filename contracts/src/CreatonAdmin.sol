// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
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

contract CreatonAdmin is Ownable, SuperAppBase{
    
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string metadataURL, uint256 subscriptionPrice);
    event NewSubscriber(address user, uint256 amount);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => address[]) public creator2contract; // this could go wrong cause of the set
    mapping(address => address) public contract2creator;

    address private _host;
    address private _cfa;
    address private _acceptedToken;

    address public treasury;
    int96 treasury_fee;

    address public trustedForwarder;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor(
        address host,
        address cfa,
        address acceptedToken, // get these from superfluid contracts
        address _treasury,
        int96 _treasury_fee,
        address _trustedForwarder
    ) {
        assert(host != address(0));
        assert(cfa != address(0));
        assert(acceptedToken != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        treasury = _treasury;
        treasury_fee = _treasury_fee;

        trustedForwarder = _trustedForwarder;
    }

    // -----------------------------------------
    // Logic 
    // -----------------------------------------

    modifier trustedForwarderOnly() {
        require(msg.sender == address(trustedForwarder), "Function can only be called through the trusted Forwarder");
        _;
    }

    function isTrustedForwarder(address forwarder) public view returns(bool) {
        return forwarder == trustedForwarder;
    }

    function msgSender() internal view returns (address payable ret) {
        if (msg.data.length >= 24 && isTrustedForwarder(msg.sender)) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                ret := shr(96,calldataload(sub(calldatasize(),20)))
            }
        } else {
            return msg.sender;
        }
    }

    function deployCreator(string calldata metadataURL, uint256 subscriptionPrice) external {
        Creator creatorContract =
            new Creator(
                ISuperfluid(_host),
                IConstantFlowAgreementV1(_cfa),
                ISuperToken(_acceptedToken)
            ); 
        creatorContract.init(msgSender(), metadataURL, subscriptionPrice, treasury, treasury_fee);
        //  TODO do not pass this, get treasury address and fee from CreatonAdmin

        address creatorContractAddr = address(creatorContract);
        contract2creator[creatorContractAddr] = msgSender();
        creator2contract[msgSender()].push(creatorContractAddr);

        emit CreatorDeployed(msg.sender, creatorContractAddr, metadataURL, subscriptionPrice);
    }
    
}
