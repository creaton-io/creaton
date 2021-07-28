pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestingToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Testing Token", "TT") {
        _mint(msg.sender, initialSupply);
    }
    function faucet() public {
        _mint(msg.sender, 1000 * 1e18);
        // increaseAllowance(msg.sender, 1000 * 1e18);
    }
}
