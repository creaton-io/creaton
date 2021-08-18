pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "../dependency/gsn/forwarder/IForwarder.sol";
import "../dependency/gsn/BasePaymaster.sol";

//import "./IMetatxStaking.sol";

contract CreatonPaymaster is BasePaymaster {
    address public creatonAdmin;
    address public token;
    address public stakingContract;
    mapping(address => bool) public targets; // The target contracts we are willing to pay for

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

    constructor() public {
        //stakingContract = _stakingContract;
        //targets[stakingContract] = true;
    }

    function preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) external virtual override returns (bytes memory context, bool) {
        _verifyForwarder(relayRequest);
        (signature, approvalData, maxPossibleGas);

        //if (
        //    IMetatxStaking(stakingContract).balanceOf(relayRequest.request.from) >=
        //    IMetatxStaking(stakingContract).getMinStake()
        //) {
        require(targets[relayRequest.request.to], "Creaton Paymaster: Destination contract not supported");
        return (new bytes(0), false);
        //}

        //        if (relayRequest.request.to == stakingContract){
        //            bytes4 sig =
        //            relayRequest.request.data[0] |
        //            (bytes4(relayRequest.request.data[1]) >> 8) |
        //            (bytes4(relayRequest.request.data[2]) >> 16) |
        //            (bytes4(relayRequest.request.data[3]) >> 24);
        //            require( sig == bytes4(keccak256("stake(uint256)")), "Creaton Paymaster: Signature mismatch");
        //            (address recipient, ,) = abi.decode(relayRequest.request.data[4:], (address,uint256,bytes));
        //            require(recipient == stakingContract, "Creaton Paymaster: Only free staking is supported");
        //            return (new bytes(0), false);
        //        }

        revert("Creaton Paymaster: No rules applicable");
    }

    function postRelayedCall(
        bytes calldata context,
        bool success,
        uint256 gasUseWithoutPost,
        GsnTypes.RelayData calldata relayData
    ) external virtual override {
        (context, success, gasUseWithoutPost, relayData);
    }

    function versionPaymaster() external view virtual override returns (string memory) {
        return "2.2.3-matic";
    }

    modifier onlyAdmin() {
        require(msg.sender == creatonAdmin, "Not Admin");
        _;
    }
}
