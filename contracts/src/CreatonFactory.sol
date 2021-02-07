// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

// import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
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

contract CreatonFactory is ISuperApp{
    using SafeMath for uint256;
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address creator, address creatorContract, string metadataURL, uint256 subscriptionPrice);
    event NewSubscriber(address user, uint256 amount);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => mapping(uint256 => address)) public creator2contract;
    mapping(address => address) public contract2creator;

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
        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
        _host.registerApp(configWord);
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

        console.log("pre init");
        creatorContract.init(msg.sender, metadataURL, subscriptionPrice);
        console.log("post init");
        creatorContracts[msg.sender] = creatorContractAddr;
        _msgSender()
        emit CreatorDeployed(msg.sender, creatorContractAddr, metadataURL, subscriptionPrice);
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
        cbdata = _beforePlay(ctx);
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
        return _play(ctx, agreementClass, agreementId, cbdata);
    }

    function beforeAgreementUpdated(
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
        cbdata = _beforePlay(ctx);
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
        return _play(ctx, agreementClass, agreementId, cbdata);
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

    ///
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
        return _quit(ctx);
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
    
}
