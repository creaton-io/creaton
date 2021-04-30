pragma solidity ^0.8.0;

import {
    ISuperToken,
    CustomSuperTokenProxyBase
}
from "../../dependency/superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/CustomSuperTokenProxyBase.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../dependency/gsn/contracts/BaseRelayRecipient.sol";

//import { UUPSProxiable } from "@superfluid-finance/ethereum-contracts/contracts/upgradability/UUPSProxiable.sol";

interface INativeSuperToken {
    function initialize(string calldata name, string calldata symbol, uint256 initialSupply, address trustedForwarder) external;
}

contract CreatonToken is INativeSuperToken, CustomSuperTokenProxyBase, BaseRelayRecipient{

    address public trustedForwarder;

    function initialize
    (
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        address _trustedForwarder
    )
        external override
    {
        ISuperToken(address(this)).initialize(
            IERC20(address(0x0)), // no underlying/wrapped token
            18, // shouldn't matter if there's no wrapped token
            name,
            symbol
        );
        ISuperToken(address(this)).selfMint(msg.sender, initialSupply, new bytes(0));
        trustedForwarder = _trustedForwarder;
    }

    function isTrustedForwarder(address forwarder) public view returns(bool) {
        return forwarder == trustedForwarder;
    }

}
