pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/**
A demo token, for if users decide they want to have token giveaways, this is how they would handle it, setting the price, 
by default, the faucet generates 10 tokens per use.
 */
contract FanToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Stakeable token", "FAN") {
        _mint(msg.sender, initialSupply);
    }

    function faucet() public {
        // 10 tokens
        _mint(msg.sender, 10000000000000000000);
    }
}