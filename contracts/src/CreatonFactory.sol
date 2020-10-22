// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "buidler-deploy/solc_0.7/proxy/Proxied.sol";
import "./utils/SafeMath.sol";
import "@nomiclabs/buidler/console.sol";
import "./Creator.sol";

contract CreatonFactory is Proxied {
    using SafeMath for uint256;
    // -----------------------------------------
    // Events
    // -----------------------------------------

    event CreatorDeployed(address user, address creatorContract, string title, uint256 subscriptionPrice);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    mapping(address => address) public creatorContracts;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    constructor() {}

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function deployCreator(
        string calldata avatarURL,
        string calldata title, 
        uint256 subscriptionPrice) external {
            
        Creator creatorContract = new Creator();
        address creatorContractAddr = address(creatorContract);
        creatorContract.init(
            avatarURL,
            title, 
            subscriptionPrice);
        creatorContracts[msg.sender] = creatorContractAddr;

        emit CreatorDeployed(msg.sender, creatorContractAddr, title, subscriptionPrice);
    }
}
