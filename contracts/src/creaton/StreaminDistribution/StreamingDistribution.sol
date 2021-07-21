pragma solidity ^0.8.0;

import {
    ISuperfluid,
    ISuperToken,
    SuperAppBase,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {
    IInstantDistributionAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ERC777 } from "@openzeppeling/contracts/token/ERC777/ERC777.sol";

contract StreamingDistribution is 
    Ownable,
    ERC777,
    SuperAppBase,
    
    {   
        uint32 public constant INDEX_ID = 0;
        ISuperToken private _redeemableToken; // Creator made token for distribution among patron
        ISuperfluid private _host; //host
        IInstantDistributionAgreementV1 private _ida; // Address for the IDA
        constructor(
            ISuperToken redeemableToken,
            Isuperfluid host,
            IInstantDistributionAgreementV1 ida,
            string memory name,
            string memory symbol

        )
        ERC777(name,symbol)
        {
            assert(address(redeemableToken)!= address(0));
            assert(address(host)!= address(0));
            assert(address(ida)!= address(0));
            _redeemableToken = redeemableToken;
            _host = host;
            _ida = ida;
            uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;
            _host.registerApp(configWord);
            _host.callAgreement(
            _ida,
            abi.encodeWithSelector(
                _ida.createIndex.selector,
                _cashToken,
                INDEX_ID,
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );

        transferOwnership(msg.sender);
        _setupDecimals(0);
        }
       //_InitialBufferTokens(address subscriber,uint256 amount) private 
    
    }