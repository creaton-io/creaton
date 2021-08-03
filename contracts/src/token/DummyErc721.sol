// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DummyErc721 is ERC721 {
    constructor() ERC721("DummyErc721", "DUM721") {
    }

    function mint(uint256 tokenId) public {
        _safeMint(_msgSender(), tokenId);
    }
}