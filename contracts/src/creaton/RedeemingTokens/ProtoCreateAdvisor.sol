pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//ALSO USED FOR MARKETING!!!
contract ProtoCreateAdvisor is ERC20, Ownable {
    //only exists to be converted into Create for the Advisors.
    constructor() ERC20("Proto Create Advisor", "PCA") {
        _mint(msg.sender, 5000000*(10**18));
    }
}
