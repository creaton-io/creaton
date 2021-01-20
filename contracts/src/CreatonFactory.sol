// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./utils/SafeMath.sol";
import "hardhat/console.sol";
import "./CreatonSuperApp.sol";

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

contract CreatonFactory is Proxied {
    using SafeMath for uint256;
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address user, address creatorContract, string metadataURL, uint256 subscriptionPrice);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => address) public creatorContracts;

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
    ) {
        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function deployCreator(string calldata metadataURL, uint256 subscriptionPrice) external {
        console.log("pre construct");
        CreatonSuperApp creatorContract = new CreatonSuperApp(_host, _cfa, _acceptedToken); //can just add the metadataurl and subscriptiionprice extra here now and in the sol lol
        console.log("post construct");
        address creatorContractAddr = address(creatorContract);
        //0x8EA403f69173CB3271DBBa1916DD99d8E294B46f
        //0x270a86E3F664b4c6db6a1CD6f7309Ca2E468Fc85
        //0xb4459DDF9CCc27F31a37692032547F48b6EcE274
        console.log("pre init");
        creatorContract.init(msg.sender, metadataURL, subscriptionPrice);
        console.log("post init");
        creatorContracts[msg.sender] = creatorContractAddr;

        emit CreatorDeployed(msg.sender, creatorContractAddr, metadataURL, subscriptionPrice);
    }
}
