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

import "./StakedFlow.sol";

contract ReactionToken is Context, ERC20 {
    event Staked(address author, uint256 amount, address stakingTokenAddress);
    event Reacted(address author, address nftAddress, uint256 tokenId, address reactionTokenAddress, uint256 amount, string reactionTokenName, string reactionTokenSymbol);
    event Flowed(address flow, uint256 amount, address stakingTokenAddress, address recipient, address stakingSuperTokenAddress);

    address private _sfHost; // host
    address private _sfCfa; // the stored constant flow agreement class address

    string internal _tokenMetadataURI; // Metadata url

    address internal _reactionFactory;

    mapping(address => mapping(address => address)) internal _stakedFlows;

    constructor(
        address reactionFactory,
        address sfHost, 
        address sfCfa, 
        string memory reactionTokenName, 
        string memory reactionTokenSymbol,
        string memory tokenMetadataURI
    ) ERC20(reactionTokenName, reactionTokenSymbol) {
        require(address(reactionFactory) != address(0), "ReactionToken: Reaction Factory can't be 0x");
        require(address(sfHost) != address(0), "ReactionToken: Host Address can't be 0x");
        require(address(sfCfa) != address(0), "ReactionToken: CFA Address can't be 0x");

        _reactionFactory = reactionFactory;
        _sfHost = sfHost;
        _sfCfa = sfCfa;

        _tokenMetadataURI = tokenMetadataURI;
    }

    function stakeAndMint(uint256 amount, address stakingTokenAddress, address nftAddress, uint256 tokenId) public {
        require(address(stakingTokenAddress) != address(0), "ReactionToken: Staking Token Address can't be 0x");
        require(address(nftAddress) != address(0), "ReactionToken: NFT Address can't be 0x");

        // Stake everything to the StakedFlow
        StakedFlow stakedFlow = StakedFlow(_stakedFlows[_msgSender()][stakingTokenAddress]);
        if(address(stakedFlow) == address(0)){
            stakedFlow = new StakedFlow(_reactionFactory, _sfHost, _sfCfa);
            _stakedFlows[_msgSender()][stakingTokenAddress] = address(stakedFlow);
        }

        IERC20(stakingTokenAddress).transferFrom(_msgSender(), address(stakedFlow), amount);
        emit Staked(_msgSender(), amount, stakingTokenAddress);

        // Mint the reaction token straight to the NFT
        _mint(nftAddress, amount);
        ERC20 reactionToken = ERC20(address(this));
        emit Reacted(_msgSender(), nftAddress, tokenId, address(this), amount, reactionToken.name(), reactionToken.symbol());

        // Upsert the stream the staked amount
        address stakingSuperTokenAddress = stakedFlow.flow(amount, stakingTokenAddress, _msgSender());
        emit Flowed(address(stakedFlow), amount, stakingTokenAddress, _msgSender(), stakingSuperTokenAddress); 
    }

    function getTokenMetadataURI() public view returns (string memory) {
        return _tokenMetadataURI;
    }
}