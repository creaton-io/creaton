pragma solidity 0.8.0;

import "./Post.sol";

contract NFTFactory {
    constructor () {

    }

    function createPostNFT(string memory name, string memory symbol, string memory baseTokenURI, address minter) public returns (address){
        return address(new Post(name, symbol, baseTokenURI, minter));
    }
}
