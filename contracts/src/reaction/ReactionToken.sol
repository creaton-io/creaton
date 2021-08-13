// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

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

contract ReactionToken is Context, ERC20 {
    event Staked(address author, uint256 amount, address stakingTokenAddress, address stakingSuperTokenAddress);
    event Reacted(address author, address nftAddress, uint256 tokenId, address reactionTokenAddress, uint256 amount, string reactionTokenName, string reactionTokenSymbol);

    ISuperfluid internal _host; // Superfluid host address
    IConstantFlowAgreementV1 internal _cfa; // Superfluid Constant Flow Agreement address
    ISuperTokenFactory internal _superTokenFactory; // Superfluid Supertoken Factory

    string internal _tokenMetadataURI; // Metadata url

    ReactionFactory internal _reactionFactory;

    struct Flow {
        address token;
        uint256 amount;
    }

    mapping (address => mapping(address => uint256)) private _userStaked; // userAddress => (tokenAddress => amountStaked)

    constructor(
        address reactionFactory,
        address host, 
        address cfa, 
        address superTokenFactory, 
        string memory reactionTokenName, 
        string memory reactionTokenSymbol,
        string memory tokenMetadataURI
    ) ERC20(reactionTokenName, reactionTokenSymbol) {
        require(address(reactionFactory) != address(0), "ReactionToken: Reaction Factory can't be 0x");
        require(address(host) != address(0), "ReactionToken: Host Address can't be 0x");
        require(address(cfa) != address(0), "ReactionToken: CFA Address can't be 0x");
        require(address(superTokenFactory) != address(0), "ReactionToken: SuperTokenFactory Address can't be 0x");

        _reactionFactory = ReactionFactory(reactionFactory);
        _host = ISuperfluid(host);
        _cfa =  IConstantFlowAgreementV1(cfa);
        _superTokenFactory = ISuperTokenFactory(superTokenFactory);

        _tokenMetadataURI = tokenMetadataURI;
    }

    function stakeAndMint(uint256 amount, address stakingTokenAddress, address nftAddress, uint256 tokenId) public {
        require(address(stakingTokenAddress) != address(0), "ReactionToken: Staking Token Address can't be 0x");
        require(address(nftAddress) != address(0), "ReactionToken: NFT Address can't be 0x");

        ERC20WithTokenInfo stakingToken = ERC20WithTokenInfo(stakingTokenAddress);

        // Store the staked amount
        _userStaked[_msgSender()][stakingTokenAddress] = _userStaked[_msgSender()][stakingTokenAddress] + amount;
        
        // Stake everything here
        IERC20(stakingToken).transferFrom(_msgSender(), address(this), amount);

        // Mint the reaction token straight to the NFT
        _mint(nftAddress, amount);

        // Get/Create the super token
        address stakingSuperToken = _reactionFactory.isSuperToken(stakingToken) ? address(stakingToken) : _reactionFactory.getSuperToken(stakingToken);
        if (stakingSuperToken == address(0)) {
            stakingSuperToken = address(_reactionFactory.createSuperToken(stakingToken));
        
            // Approve token to be upgraded
            if (stakingToken.allowance(address(this), stakingSuperToken) < amount) {
                bool success = stakingToken.approve(stakingSuperToken, amount); // max allowance
                require(success, "ReactionToken: Failed to approve allowance to SuperToken");
            }

            // Give token Superpowers
            ISuperToken(stakingSuperToken).upgrade(amount);
        }
        
        // Calculate the flow rate
        uint256 secondsInAMonth = 2592000;
        uint256 flowRate = amount/secondsInAMonth; // return the whole stake in one month

        // Create/Uodate CFA
        (,int96 outFlowRate, uint256 deposit,) = _cfa.getFlow(ISuperToken(stakingSuperToken), address(this), _msgSender());

        if(outFlowRate > 0){
            _host.callAgreement(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.updateFlow.selector,
                    stakingSuperToken,
                    _msgSender(),
                    _cfa.getMaximumFlowRateFromDeposit(ISuperToken(stakingSuperToken), deposit),
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
                    _msgSender(),
                    flowRate,
                    new bytes(0) // placeholder
                ),
                new bytes(0)
            );
        }

        emit Staked(_msgSender(), amount, stakingTokenAddress, stakingSuperToken);

        ERC20 reactionToken = ERC20(address(this));
        emit Reacted(_msgSender(), nftAddress, tokenId, address(this), amount, reactionToken.name(), reactionToken.symbol());
    }

    function getTokenMetadataURI() public view returns (string memory) {
        return _tokenMetadataURI;
    }

    function getStakedAmount(address user, address stakingToken) public view returns(uint256) {
        return _userStaked[user][stakingToken];
    }
}