pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Rewards is Ownable {
  using SafeMath for uint256;
    
    mapping(address => uint256) private balances; //address => amount owed.
    IERC20 public token;

    constructor(
        IERC20 _tokenAddress
    ) public {
        token = IERC20(_tokenAddress);
    }

    event UserRedeemed(address indexed user, uint256 amount);
    event NewReward(address indexed user, uint256 amount);

    function redeem(address user) public {
        require(token.balanceOf(address(this)) > balances[user], "Contract Needs More Funds");
        token.transfer(user, balances[user]);
        emit UserRedeemed(user, balances[user]);
        balances[user] = 0;
    }
    function setRewards(address user, uint256 amount)public onlyOwner {
        //you don't pay this, since this is run Hundreds of times. Pay all at once.
        balances[user] += amount;
        emit NewReward(user, balances[user]);
    }
    function getRewards(address user) public view returns (uint256) {
        return balances[user];
    }

}