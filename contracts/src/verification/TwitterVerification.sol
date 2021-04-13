pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "../gsn/contracts/OwnableBaseRelayRecipient.sol";
import { CBORChainlink } from "@chainlink/contracts/src/v0.6/vendor/CBORChainlink.sol";
import { BufferChainlink } from "@chainlink/contracts/src/v0.6/vendor/BufferChainlink.sol";
import {ECDSA} from "../utils/ECDSA.sol";

contract TwitterVerification is ChainlinkClient, OwnableBaseRelayRecipient {
    using ECDSA for bytes32;
    using CBORChainlink for BufferChainlink.buffer;

    event RequestTwitterVerificationFulfilled(bytes32 indexed requestId, bytes32 indexed username);
    event UserSignUpResult(address userAddress, string username, bool result);

    uint256 constant private ORACLE_PAYMENT = 0.1 * 10 ** 18;
    mapping(bytes32 => string) request2username;
    mapping(bytes32 => address) request2address;
    address private _oracle;
    address private _admin;
    string private _jobId;
    BufferChainlink.buffer private buf;

    constructor(address link, address oracle, string memory jobId, address _trustedForwarder, address admin) public OwnableBaseRelayRecipient() {
        setChainlinkToken(link);
        _oracle = oracle;
        _jobId = jobId;
        trustedForwarder = _trustedForwarder;
        _admin = admin;
    }

    function requestTwitterVerification(bytes memory signature, uint256 hash, string memory username) public {
        require(verifySignature(signature, _msgSender(), username), "Incorrect Signature");
        require(bytes32(hash) == keccak256(signature));
        Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillVerification.selector);
        req.addBytes("hashtag", abi.encodePacked(hash));
        req.add("username", username);
        bytes32 reqId = sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
        request2username[reqId] = username;
        request2address[reqId] = _msgSender();
    }

    function fulfillVerification(bytes32 _requestId, bool result) public recordChainlinkFulfillment(_requestId)
    {
        emit UserSignUpResult(request2address[_requestId], request2username[_requestId], result);
        if (result) {
            _admin.call(abi.encodeWithSignature("signUp(address,string)", request2address[_requestId], request2username[_requestId]));
        }
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(_msgSender(), link.balanceOf(address(this))), "Unable to transfer");
    }

    function cancelRequest(bytes32 _requestId, uint256 _payment, bytes4 _callbackFunctionId, uint256 _expiration)
    public onlyOwner {
        cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    function versionRecipient() external view override  returns (string memory){
        return "2.1.0";
    }

    function verifySignature(bytes memory signature, address userAddress, string memory username) public view returns (bool) {

        string memory header = "\x19Ethereum Signed Message:\n000000";
        string memory main = "Signing Up on Creaton With My Twitter Account: @";
        string memory message = string(abi.encodePacked(main, username));
        uint256 lengthOffset;
        uint256 length;
        assembly {
            length := mload(message)
            lengthOffset := add(header, 57)
        }

        require(length <= 999999);

        uint256 lengthLength = 0;

        uint256 divisor = 100000;

        while (divisor != 0) {

            uint256 digit = length / divisor;
            if (digit == 0) {
                if (lengthLength == 0) {
                    divisor /= 10;
                    continue;
                }
            }

            lengthLength++;

            length -= digit * divisor;

            divisor /= 10;

            digit += 0x30;
            lengthOffset++;

            assembly {
                mstore8(lengthOffset, digit)
            }
        }

        if (lengthLength == 0) {
            lengthLength = 1 + 0x19 + 1;
        } else {
            lengthLength += 1 + 0x19;
        }

        assembly {
            mstore(header, lengthLength)
        }

        bytes32 check = keccak256(abi.encodePacked(header, message));
        return (userAddress == check.recover(signature));
    }

}
