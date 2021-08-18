pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "../dependency/gsn/BaseRelayRecipient.sol";
import "../utils/Owned.sol";

// Inheritance
import "./IMetatxStaking.sol";

contract MetatxStaking is IMetatxStaking, BaseRelayRecipient, ReentrancyGuard, Pausable, Owned {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== ERC1820 RECIPIENT REGISTRY ========== */

    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 private constant TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

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
        address _token,
        address _trustedForwarder
    ) public Owned(_owner) {
        token = IERC20(_token);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
        trustedForwarder = _trustedForwarder;
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
        return
            _balances[account].mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(
                rewards[account]
            );
    }

    function getRewardForDuration() external view override returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    function getMinStake() external view override returns (uint256) {
        return minStake;
    }

    function _msgSender() internal view virtual override(Context, BaseRelayRecipient) returns (address ret) {
        if (msg.data.length >= 20 && isTrustedForwarder(msg.sender)) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                ret := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            ret = msg.sender;
        }
    }

    function _msgData() internal view virtual override(Context, BaseRelayRecipient) returns (bytes memory ret) {
        if (msg.data.length >= 20 && isTrustedForwarder(msg.sender)) {
            return msg.data[0:msg.data.length - 20];
        } else {
            return msg.data;
        }
    }

    function versionRecipient() external view override returns (string memory) {
        return "2.2.3-matic";
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount) public override nonReentrant whenNotPaused updateReward(_msgSender()) {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[_msgSender()] = _balances[_msgSender()].add(amount);
        token.safeTransferFrom(_msgSender(), address(this), amount);
        emit Staked(_msgSender(), amount);
    }

    function withdraw(uint256 amount) public override nonReentrant updateReward(_msgSender()) {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[_msgSender()] = _balances[_msgSender()].sub(amount);
        token.safeTransfer(_msgSender(), amount);
        emit Withdrawn(_msgSender(), amount);
    }

    function getReward() public override nonReentrant updateReward(_msgSender()) {
        uint256 reward = rewards[_msgSender()];
        if (reward > 0) {
            rewards[_msgSender()] = 0;
            token.safeTransferFrom(address(rewardEscrow), _msgSender(), reward);
            emit RewardPaid(_msgSender(), reward);
        }
    }

    function exit() external override {
        withdraw(_balances[_msgSender()]);
        getReward();
    }

    // Do not forget to send reward escrow the caller prize
    function halvingRewards() external override updateReward(address(0)) whenNotPaused whenNotLastPeriod {
        if (block.timestamp > periodFinish) {
            token.safeTransferFrom(address(rewardEscrow), _msgSender(), minStake);
            if (rewardsDuration == oldRewardsDuration) {
                rewardRate = rewardRate.div(2);
            } else {
                rewardRate = rewardRate.mul(oldRewardsDuration).div(rewardsDuration).div(2);
                oldRewardsDuration = rewardsDuration;
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
    event RewardStarted(uint256 rewardRate);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event MinStakeUpdated(uint256 minStake);
}
