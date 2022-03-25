// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "../dependency/gsn/BaseRelayRecipient.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance_1/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    ISuperfluid,
    ISuperToken,
    ISuperTokenFactory
} from "@superfluid-finance_1/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import "./ReactionFactory.sol";
import "./StakedFlow.sol";

contract ReactionToken is ERC20, BaseRelayRecipient {
    event Staked(address author, uint256 amount, address stakingTokenAddress);
    event Reacted(address author, address reactionRecipientAddress, uint256 tokenId, address reactionTokenAddress, uint256 amount, string reactionTokenName, string reactionTokenSymbol);
    event Flowed(address flow, uint256 amount, address stakingTokenAddress, address recipient, address stakingSuperTokenAddress);

    address private _sfHost; // host
    address private _sfCfa; // the stored constant flow agreement class address

    address private _stakingTokenAddress; // If 0x, all tokens will be accepted to stake
    uint8 private _monthDistributionPercentage; // Monthly percentage to be returned (0-100)

    string internal _tokenMetadataURI; // Metadata url

    ReactionFactory internal _reactionFactory;

    constructor(
        address reactionFactory,
        address sfHost, 
        address sfCfa, 
        address stakingTokenAddress,
        string memory reactionTokenName, 
        string memory reactionTokenSymbol,
        string memory tokenMetadataURI,
        uint8 monthDistributionPercentage,
        address _trustedForwarder
    ) ERC20(reactionTokenName, reactionTokenSymbol) {
        require(address(reactionFactory) != address(0), "ReactionToken: Reaction Factory can't be 0x");
        require(address(sfHost) != address(0), "ReactionToken: Host Address can't be 0x");
        require(address(sfCfa) != address(0), "ReactionToken: CFA Address can't be 0x");
        require(monthDistributionPercentage < 101, "ReactionToken: monthDistributionPercentage must be between 0 and 100");
        require(monthDistributionPercentage > 0, "ReactionToken: monthDistributionPercentage must be between 0 and 100");

        _reactionFactory = ReactionFactory(reactionFactory);
        _sfHost = sfHost;
        _sfCfa = sfCfa;

        _stakingTokenAddress = stakingTokenAddress;
        _monthDistributionPercentage = monthDistributionPercentage;
        _tokenMetadataURI = tokenMetadataURI;

        trustedForwarder = _trustedForwarder;
    }

    function stakeAndMint(uint256 amount, address stakingTokenAddress, address reactionRecipientAddress, uint256 tokenId) public {
        require(address(stakingTokenAddress) != address(0), "ReactionToken: Staking Token Address can't be 0x");
        require(address(reactionRecipientAddress) != address(0), "ReactionToken: reactionRecipient Address can't be 0x");

        // Verify if the staking token is correct
        if(_stakingTokenAddress != address(0)){
            require(address(stakingTokenAddress) == address(_stakingTokenAddress), "ReactionToken: Invalid Staking Token");
        }

        // Stake everything to the StakedFlow
        StakedFlow stakedFlow = StakedFlow(_reactionFactory.getStakedFlow(_msgSender(), stakingTokenAddress, _monthDistributionPercentage));

        IERC20(stakingTokenAddress).transferFrom(_msgSender(), address(stakedFlow), amount);
        emit Staked(_msgSender(), amount, stakingTokenAddress);

        // Mint the reaction token straight to the Recipient
        _mint(reactionRecipientAddress, amount);
        ERC20 reactionToken = ERC20(address(this));
        emit Reacted(_msgSender(), reactionRecipientAddress, tokenId, address(this), amount, reactionToken.name(), reactionToken.symbol());

        // Upsert the stream the staked amount
        address stakingSuperTokenAddress = stakedFlow.flow(amount, stakingTokenAddress, _msgSender());
        emit Flowed(address(stakedFlow), amount, stakingTokenAddress, _msgSender(), stakingSuperTokenAddress); 
    }

    function getTokenMetadataURI() public view returns (string memory) {
        return _tokenMetadataURI;
    }

    function getStakingTokenAddress() public view returns (address) {
        return _stakingTokenAddress;
    }

    function versionRecipient() external view virtual override returns (string memory) {
        return "2.2.3-matic";
    }

    function _msgSender() internal view override(Context, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(Context, BaseRelayRecipient)
        returns (bytes memory) {
        return BaseRelayRecipient._msgData();
    }
    
}