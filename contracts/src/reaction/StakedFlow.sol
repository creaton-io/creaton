// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/utils/Context.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance_1/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    ISuperfluid,
    ISuperToken,
    ISuperTokenFactory
} from "@superfluid-finance_1/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ERC20WithTokenInfo } from "@superfluid-finance_1/ethereum-contracts/contracts/interfaces/tokens/ERC20WithTokenInfo.sol";

import "./ReactionFactory.sol"; 

contract StakedFlow is Context {
    event Flowing(address stakingSuperToken, uint256 balance, address recipient, uint256 flowRate);

    ISuperfluid internal _host; // Superfluid host address
    IConstantFlowAgreementV1 internal _cfa; // Superfluid Constant Flow Agreement address
    ISuperTokenFactory internal _superTokenFactory; // Superfluid Supertoken Factory

    ReactionFactory internal _reactionFactory;

    uint8 internal _monthDistributionPercentage;

    constructor(
        address reactionFactory,
        address host, 
        address cfa,
        uint8 monthDistributionPercentage
    ) {
        require(address(reactionFactory) != address(0), "StakedFlow: Reaction Factory can't be 0x");
        require(address(host) != address(0), "StakedFlow: Host Address can't be 0x");
        require(address(cfa) != address(0), "StakedFlow: CFA Address can't be 0x");
        require(monthDistributionPercentage < 101, "StakedFlow: monthDistributionPercentage must be between 0 and 100");
        require(monthDistributionPercentage > 0, "StakedFlow: monthDistributionPercentage must be between 0 and 100");

        _reactionFactory = ReactionFactory(reactionFactory);
        _host = ISuperfluid(host);
        _cfa =  IConstantFlowAgreementV1(cfa);
        _monthDistributionPercentage = monthDistributionPercentage;
    }

    function flow(uint256 amount, address stakingTokenAddress, address recipient) public returns (address){
        require(address(stakingTokenAddress) != address(0), "StakedFlow: Staking Token Address can't be 0x");

        ERC20WithTokenInfo stakingToken = ERC20WithTokenInfo(stakingTokenAddress);

        // Get/Create the super token
        address stakingSuperToken = _reactionFactory.isSuperToken(stakingToken) ? address(stakingToken) : _reactionFactory.getSuperToken(stakingToken);
        if (stakingSuperToken == address(0)) {
            stakingSuperToken = address(_reactionFactory.createSuperToken(stakingToken));
        }

        // Approve token to be upgraded
        if (stakingToken.allowance(address(this), stakingSuperToken) < amount) {
            bool success = stakingToken.approve(stakingSuperToken, amount); // max allowance
            require(success, "ReactionToken: Failed to approve allowance to SuperToken");
        }

        // Give token Superpowers
        if(address(stakingToken) != address(stakingSuperToken)){
            ISuperToken(stakingSuperToken).upgrade(amount);
        }

        // Calculate the flow rate
        uint256 secondsInAMonth = 2592000;
        uint256 balance = ISuperToken(stakingSuperToken).balanceOf(address(this));
        uint256 flowRate = (balance*_monthDistributionPercentage)/(secondsInAMonth*100);

        // Create/Uodate CFA
        (, int96 outFlowRate,,) = _cfa.getFlow(ISuperToken(stakingSuperToken), address(this), recipient);
        if(outFlowRate > 0){
            _host.callAgreement(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.updateFlow.selector,
                    stakingSuperToken,
                    recipient,
                    flowRate,
                    new bytes(0) // placeholder
                ),
                new bytes(0)
            );
        }else{
            _host.callAgreement(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    stakingSuperToken,
                    recipient,
                    flowRate,
                    new bytes(0) // placeholder
                ),
                new bytes(0)
            );
        }

        emit Flowing(stakingSuperToken, balance, recipient, flowRate);

        return stakingSuperToken;
    }
}