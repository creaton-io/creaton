pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CreatorToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 2**256-1);//max uint256, 1111...1
        //DO NOT CHANGE TO _msgSender(), WE NEED THIS TO BE CONTRACT CALLABLE
    }
}
