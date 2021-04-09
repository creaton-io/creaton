pragma solidity 0.8.0;
pragma abicoder v2;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "../gsn/contracts/forwarder/IForwarder.sol";
import "../gsn/contracts/BasePaymaster.sol";

contract CreatonPaymaster is BasePaymaster {

    address public creatonAdmin;
	mapping(address=>bool) public targets ;   // The target contracts we are willing to pay for

	function setAdmin(address admin) external onlyOwner {
        creatonAdmin = admin;
        targets[creatonAdmin] = true;
	}

    function addCreatorContract(address creatorContract) public onlyAdmin {
        targets[creatorContract] = true;
    }

	function preRelayedCall(
		GsnTypes.RelayRequest calldata relayRequest,
		bytes calldata signature,
		bytes calldata approvalData,
		uint256 maxPossibleGas
	) external override virtual
	returns (bytes memory context, bool) {
		_verifyForwarder(relayRequest);
		(signature, approvalData, maxPossibleGas);

		require(targets[relayRequest.request.to]);
        return (new bytes(0), false);
	}

	function postRelayedCall(
		bytes calldata context,
		bool success,
		uint256 gasUseWithoutPost,
		GsnTypes.RelayData calldata relayData
	) external override virtual {
        (context, success, gasUseWithoutPost, relayData);
	}

    function versionPaymaster() external virtual view override returns (string memory) {
        return "2.1.0";
    }

    modifier onlyAdmin() {
        require(msg.sender == creatonAdmin, "Not Admin");
        _;
    }

}
