pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProtoCreateTeam is ERC20, Ownable {
    //only exists to be converted into Create for the team.
    constructor() ERC20("Proto Create Team", "PCT") {
        _mint(msg.sender, 33000000*(10**18));
    }
}
