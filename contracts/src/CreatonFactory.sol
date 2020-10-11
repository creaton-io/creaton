// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "buidler-deploy/solc_0.7/proxy/Proxied.sol";
import "@nomiclabs/buidler/console.sol";
import "./Creator.sol";

contract CreatonFactory is Proxied {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address indexed user, Creator creatorContract);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    // TODO: change this to a mapping: creator's address => contract address
    Creator[] creatorContracts;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor() {}

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function deployCreator(
        string calldata creatorTitle, 
        uint256 subscriptionPrice, 
        uint256 projectDuration) external {
            
        Creator _creatorContract = new Creator();
        _creatorContract.init(creatorTitle, subscriptionPrice, projectDuration);
        creatorContracts.push(_creatorContract);

        emit CreatorDeployed(msg.sender, _creatorContract);
    }

    function test() public {}
}
