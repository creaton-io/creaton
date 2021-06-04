pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract CreateStake { 
    // using Math for uint256;

    uint256 public stakingToken;

    // Stake the CREATE token 
    constructor(address _owner, uint256 _supply) public {
        // _mint(_owner, _supply);
        
    }

    // Internal stakeholders
    address[] internal stakeholders;

    // The stakes for each stakeholders
    mapping(address => uint256) internal stakes;

    // Checks if the stakeholder is registered
    function isStakeholder(address _address) public view returns(bool, uint256) {
        for (uint256 s = 0; s < stakeholders.length; s += 1){
            if (_address == stakeholders[s]) return (true, s);
        }
        return (false, 0);
    }

    function addStakeholder(address _stakeholder) public {
        (bool _isStakeholder, ) = isStakeholder(_stakeholder);

        // If the existing user isn't a stakeholder, push it 
        if(!_isStakeholder) stakeholders.push(_stakeholder);
    }

    function removeStakeholder(address _stakeholder) public {

        (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);

        // Removes the stakeholder
        if (_isStakeholder) {
            stakeholders[s] = stakeholders[stakeholders.length - 1];
            stakeholders.pop();
        } 
    }

    // A method for a stakeholder to create a stake 
    function createStake(uint256 _stake) public { 
        // _burn(msg.sender, _stake);
        if(stakes[msg.sender] == 0) addStakeholder(msg.sender);

        // Adds the stakeholder to the list of stakes 
        stakes[msg.sender] = stakes[msg.sender] + _stake;

    }

    // Removing a stake 
    function removeStake(uint256 _stake) public { 
        stakes[msg.sender] = stakes[msg.sender] - _stake;
        if(stakes[msg.sender] == 0) removeStakeholder(msg.sender);
        // _mint(msg.sender, _stake);
    }
    

}