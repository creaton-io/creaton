// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "buidler-deploy/solc_0.7/proxy/Proxied.sol";
import "@nomiclabs/buidler/console.sol";

contract Creator is Proxied {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address indexed user, address creatorContract);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => address) _creatorContracts;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    function postUpgrade(uint256 id) public proxied {}

    constructor(uint256 id) {
        postUpgrade(id); // the proxied modifier from `buidler-deploy` ensure postUpgrade effect can only be used once when the contract is deployed without proxy
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function deployCreator(
        string calldata creatorTitle, 
        uint256 subscriptionPrice, 
        uint256 projectDuration) external {
            
        console.log(creatorTitle, subscriptionPrice, projectDuration);
        // address memory _creatorContractAddr = todo: deploy contract & save to _creatorContracts 
        // _creatorContractAddr = '12345';
        // _creatorContracts[msg.sender] = _creatorContractAddr;
        // emit CreatorDeployed(msg.sender, _creatorContractAddr);
    }
}