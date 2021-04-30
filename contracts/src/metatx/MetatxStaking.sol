pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "../dependency/gsn/contracts/BaseRelayRecipient.sol";
import "../utils/Owned.sol";

// Inheritance
import "./IMetatxStaking.sol";

contract MetatxStaking is IMetatxStaking, IERC777Recipient, ReentrancyGuard, Pausable, Owned {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== ERC1820 RECIPIENT REGISTRY ========== */

    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    /* ========== STATE VARIABLES ========== */

    IERC20 public token;
    IERC20 public rewardEscrow;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public oldRewardsDuration = 30 days;
    uint256 public rewardsDuration = 30 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public minStake = 5 * 1e18;
    bool public lastPeriod = false;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _owner,
        address _token
    ) public Owned(_owner) {
        token = IERC20(_token);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function lastTimeRewardApplicable() public view override returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view override returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(_totalSupply)
            );
    }

    function earned(address account) public view override returns (uint256) {
        return _balances[account].mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(rewards[account]);
    }

    function getRewardForDuration() external view override returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function _stake(address staker, uint256 amount) internal nonReentrant whenNotPaused updateReward(staker) {
        require(amount >= minStake, "Creaton Staking: Can't stake less than required minimum");
        _totalSupply = _totalSupply.add(amount);
        _balances[staker] = _balances[staker].add(amount);
        emit Staked(staker, amount);
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        require(msg.sender == address(token), "Creaton Staking: Invalid token");
        _stake(from, amount);
    }

    function withdraw(uint256 amount) public override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() public override nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            token.safeTransferFrom(address(rewardEscrow), msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function exit() external override {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    function halvingRewards() external override updateReward(address(0)) whenNotPaused whenNotLastPeriod {
        if (block.timestamp > periodFinish) {
            token.safeTransferFrom(address(rewardEscrow), msg.sender, minStake);
            if (rewardsDuration == oldRewardsDuration){
                rewardRate = rewardRate.div(2);
            } else {
                rewardRate = rewardRate.mul(oldRewardsDuration).div(rewardsDuration).div(2);
                oldRewardsDuration = rewardsDuration;
            }
            uint balance = token.balanceOf(address(rewardEscrow));
            if (rewardRate >= balance.div(rewardsDuration)) {
                rewardRate = balance.div(rewardsDuration);
                lastPeriod = true;
            }
            lastUpdateTime = block.timestamp;
            periodFinish = block.timestamp.add(rewardsDuration);
            emit RewardHalved(periodFinish);
        }
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setInitialReward(address _rewardEscrow, uint256 _rewardRate) external onlyOwner {
        rewardEscrow = IERC20(_rewardEscrow);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardStarted(rewardRate);
    }

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        require(tokenAddress != address(token), "Cannot withdraw the staking token");
        IERC20(tokenAddress).safeTransfer(owner, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    function setMinimumStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
        emit MinStakeUpdated(minStake);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    modifier whenNotLastPeriod() {
        require(!lastPeriod, "Last period is in");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardHalved(uint256 periodFinish);
    event RewardStarted (uint256 rewardRate);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event MinStakeUpdated(uint256 minStake);
}
