pragma solidity 0.7.6;

import "@openzeppelin/contracts/proxy/BeaconProxy.sol";

contract CreatorProxy is BeaconProxy {

    constructor (address beacon, bytes memory data) BeaconProxy(beacon, data){

    }
}
