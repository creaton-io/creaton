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
        CreatonSuperApp creatorContract =
            new CreatonSuperApp(
                ISuperfluid(0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9),
                IConstantFlowAgreementV1(0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8),
                ISuperToken(0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a)
            ); //can just add the metadataurl and subscriptiionprice extra here now and in the sol lol
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
