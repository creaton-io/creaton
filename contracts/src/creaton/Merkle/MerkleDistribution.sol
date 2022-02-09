//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";


/**
  Ref: https://github.com/Uniswap/merkle-distributor
 */
contract MerkleDistributor {
    bytes32 public immutable merkleRoot;

    event Claimed(address account, uint256 amount);
    IERC20 private token;
    // address private tokenAddress;
    constructor(address _token, bytes32 merkleRoot_) {
        merkleRoot = merkleRoot_;
        // tokenAddress = _token;//i feel like this is important, but im not sure if it actually will be.
        token = IERC20(_token);
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) public {
        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(account, amount));

        require(
            MerkleProof.verify(merkleProof, merkleRoot, node),
            "MerkleDistributor: Invalid proof."
        );
        require(
            token.balanceOf(account) >= amount,
            "MerkleDistributor: Insufficient balance."
        );

        token.transfer(account, amount);

        emit Claimed(account, amount);
    }

    function getContractBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}