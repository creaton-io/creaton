// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyErc20 is ERC20 {
    constructor(uint256 initialSupply) ERC20("DummyErc20", "DUM") {
        _mint(_msgSender(), initialSupply);
    }
}