// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "buidler-deploy/solc_0.7/proxy/Proxied.sol";
import "@nomiclabs/buidler/console.sol";

contract Creator {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    string creatorTitle;
    uint256 subscriptionPrice;
    uint256 projectDuration;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    function init(
        string memory _creatorTitle,
        uint256 _subscriptionPrice,
        uint256 _projectDuration
    ) public proxied {
        creatorTitle = _creatorTitle;
        subscriptionPrice = _subscriptionPrice;
        projectDuration = _projectDuration;
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function getCreatorTitle() external view returns (string memory) {
        return creatorTitle;
    }

    function getSubscriptionPrice() public view returns (uint256) {
        return subscriptionPrice;
    }

    function getProjectDuration() public view returns (uint256) {
        return projectDuration;
    }
}
