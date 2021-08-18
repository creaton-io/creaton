pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract CreatonAdminProxy is ERC1967Proxy {
    constructor(address _logic, bytes memory _data) public ERC1967Proxy(_logic, _data) {}
}
