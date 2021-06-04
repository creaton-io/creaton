pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Created our staking token 
contract TokenStaking is ERC20, Ownable {

    using SafeMath for uint256; 

    constructor(address _owner, uint256 _supply) owner { 
        _mint(_owner, _supply); 
    }

    // Tracking stakeholders 
    address[] internal stakeholders; 


    // Verifying whether an address belongs to a stakeholder
    function isStakeholder(address _address) public view returns(bool, uint256) {
        for(uint256 i = 0; i < stakeholders.length; i += 1) { 
            if (_address == stakeholders[i]) return (true, s);
        }
        return (false, 0);
    }

    // Method to add stakeholder
    function addStakeholder(address _stakeholder) public {
        (bool _isStakeholder, ) = isStakeholder(_stakeholder);
        if (!isStakeholde) stakeholders.push(_stakeholder);
    }

    // Removing a stakeholder
    function removeStakeholder(address _stakeholder) public {
        (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);
        if (_isStakeholder) {
            stakeholders[s] = stakeholders[stakeholders.length - 1]; 
            stakeholders.pop();
        }
    }
    
    // The stake will need to record the stake size and stake holder. 
    mapping(address => uint256) internal stakes; 

    // Retrieving the stake for the stakeholder 
    // return uint256 for amount of wei staked 
    function stakeOf(address _stakeholder) public view returns(uint256) {
        return stakes[_stakeholder];
    }

    // A method to the aggregated stakes from all stakeholders 
    function totalStakes() public view returns(uint256) {
        uint _totalStakes = 0; 
        for (uint256 s = 0; s < stakeholders.length; s += 1) {
            _totalStakes = _totalStakes.add(stakes[stakeholders[s]]);
        }
        return _totalStakes; 
    }

    // Keeping record of who has the stakes 

    // Creating the stake as a stakeholder
    function createStake(uint256 _stake) public { 
        _burn(msg.sender, _stake);
        if (stakes[msg.sender] == 0) addStakeholder(msg.sender); 
        stakes[msg.sender] = stakes[msg.sender].add(_stake);
    }

    // Method for a stakeholder to remove a stake 
    function removeStake(uint256 _stake) public {
        stakes[msg.sender] = stakes[msg.sender].sub(_stake);
        if (stakes[msg.sender] == 0) removeStakeholder(msg.sender);
        _mint(msg.sender, _stake);
    }

    // Method for calculating votes 
    function calculateVote(address _stakeholder) public view returns(uint256) {
        return stakes[_stakeholder] + 1; 
    }

    // Method for distributing votes 
    function distributeVote() public onlyOwner {
        for (uint256 s = 0; s < stakeholder.length; s += 1) {
            address stakeholder = stakeholders[s]; 
            uint256 reward = calculateReward(stakeholder);
            rewards[stakeholder] = rewards[stakeholder].add(reward);
        }
    }


    // Withdrawing votes 
    function withdrawVote() public {
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0; 
        _mint(msg.sender, reward);
    }

    
    
}