pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract CreatorBeacon is UpgradeableBeacon {
    constructor(address _implementation) public UpgradeableBeacon(_implementation) {}
}
