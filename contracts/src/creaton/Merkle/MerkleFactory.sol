pragma solidity ^0.8.0;
import "./MerkleDistribution.sol";

contract MerkleFactory {
    constructor(){}

    function createMerkleDistribution(
        address token,
        bytes32 merkleRoot
    ){
        return address(new MerkleDistribution(token, merkleRoot));
    }

}