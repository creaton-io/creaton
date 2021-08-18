pragma solidity ^0.8.0;

// Inheritance
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../utils/Owned.sol";

// https://docs.synthetix.io/contracts/source/contracts/rewardsdistributionrecipient
contract RewardEscrow is Owned {
    using SafeERC20 for IERC20;

    IERC20 public token;
    address public staking;
    uint256 public infAllowance = 2**256 - 1;

    constructor(
        address _owner,
        address _token,
        address _staking
    ) public Owned(_owner) {
        staking = _staking;
        token = IERC20(_token);
        token.approve(staking, infAllowance);
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    /* ========== EVENTS ========== */

    event Recovered(address tokenAddress, uint256 tokenAmount);
}
