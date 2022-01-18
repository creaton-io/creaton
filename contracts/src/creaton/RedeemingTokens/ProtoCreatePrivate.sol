pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProtoCreatePrivate is ERC20, Ownable {
    //only exists to be converted into Create for the team.
    constructor() ERC20("Proto Create Private", "PCP") {
        _mint(msg.sender, 21000000*(10**18));
    }
}
