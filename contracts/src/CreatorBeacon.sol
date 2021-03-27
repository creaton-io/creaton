pragma solidity 0.7.6;

import "@openzeppelin/contracts/proxy/UpgradeableBeacon.sol";

contract CreatorBeacon is UpgradeableBeacon {

    constructor (address _implementation) UpgradeableBeacon(_implementation) public {

    }
}
