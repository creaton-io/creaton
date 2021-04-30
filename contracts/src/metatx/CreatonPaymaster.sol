pragma solidity 0.8.0;
pragma abicoder v2;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "../dependency/gsn/contracts/forwarder/IForwarder.sol";
import "../dependency/gsn/contracts/BasePaymaster.sol";

contract CreatonPaymaster is BasePaymaster {

    address public creatonAdmin;
    address public token;
    address public stakingContract;
	mapping(address=>bool) public targets ;   // The target contracts we are willing to pay for

    function addCreatorContract(address creatorContract) public onlyAdmin {
        targets[creatorContract] = true;
    }

    function addContract(address _contract) public onlyOwner {
        targets[_contract] = true;
    }

    function setAdmin(address _admin) public onlyOwner {
        creatonAdmin = _admin;
        targets[creatonAdmin] = true;
    }

    constructor (
        address _token,
        address _stakingContract
    ) public  {
        token = _token;
        stakingContract = _stakingContract;
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

        if (relayRequest.request.to == token){
            bytes4 sig =
            relayRequest.request.data[0] |
            (bytes4(relayRequest.request.data[1]) >> 8) |
            (bytes4(relayRequest.request.data[2]) >> 16) |
            (bytes4(relayRequest.request.data[3]) >> 24);
            require( sig == bytes4(keccak256("send(address,uint256,bytes)")), "Creaton Paymaster: Signature mismatch");
            (address recipient, ,) = abi.decode(relayRequest.request.data[4:], (address,uint256,bytes));
            require(recipient == stakingContract, "Creaton Paymaster: Only free staking is supported");
            return (new bytes(0), false);
        }

		require(targets[relayRequest.request.to], "Creaton Paymaster: Destination contract not supported");
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
