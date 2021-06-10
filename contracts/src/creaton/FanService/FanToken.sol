pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FanToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Stakeable token", "FAN") {
        _mint(msg.sender, initialSupply);
    }

    function faucet() public {
        _mint(msg.sender, 10000000000000000000);
    }
}