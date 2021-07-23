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

import { ERC777 } from "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract StreamingDistribution is 
    Ownable,
    ERC777,
    SuperAppBase
    
    {   
        uint32 public constant INDEX_ID = 0;
        address[] placeHolder;
        ISuperToken private _redeemableToken; // Creator made token for distribution among patron
        ISuperfluid private _host; //host
        IInstantDistributionAgreementV1 private _ida; // Address for the IDA
        constructor(
            ISuperToken redeemableToken,
            ISuperfluid host,
            IInstantDistributionAgreementV1 ida,
            string memory name,
            string memory symbol

        )
        ERC777(name,symbol,placeHolder)
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
                _redeemableToken,
                INDEX_ID,
                new bytes(0) // placeholder ctx
            ),
            new bytes(0) // user data
        );

        transferOwnership(msg.sender);
        
        }
       function InitialBufferTokens(address subscriber,uint256 amount) external onlyOwner {
           // Current balance of the subscriber, most likely 0 since this is supposed to be called for new subs only
           uint256 currentAmount = balanceOf(subscriber);

            //Minting some super tokens to the subscriber
            ERC777._mint(subscriber,amount,new bytes(0),new bytes(0));

            _host.callAgreement(
                _ida,
                abi.encodeWithSelector(
                    _ida.updateSubscription.selector,
                    _redeemableToken,
                    INDEX_ID,
                    subscriber,
                    uint128(currentAmount)+uint128(amount),
                    new bytes(0)),
                    new bytes(0) 
            );
                    
        

       }
       function dist(uint256 amount) external {
        _ida.distribute(_redeemableToken,INDEX_ID,amount, new bytes(0));
       } 
    
    }