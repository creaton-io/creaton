// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import "buidler-deploy/solc_0.7/proxy/Proxied.sol";
import "./utils/SafeMath.sol";
import "@nomiclabs/buidler/console.sol";
import "./ERC1155/ERC1155MixedFungibleMintable.sol";

//import "openzeppelin-solidity/contracts/presets/ERC1155PresetMinterPauser.sol";

contract Creator is Proxied, ERC1155MixedFungibleMintable {
    using SafeMath for uint256;
    // -----------------------------------------
    // Events
    // -----------------------------------------

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    address owner;
    string avatarURL;
    string creatorTitle;
    uint256 subscriptionPrice;
    string[] metadataURL;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    function init(
        string calldata _avatarURL,
        string calldata _creatorTitle,
        uint256 _subscriptionPrice
    ) public {
        owner = msg.sender;
        avatarURL = _avatarURL;
        creatorTitle = _creatorTitle;
        subscriptionPrice = _subscriptionPrice;
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function setAvatarURL(string calldata _newURL) external {
        require(msg.sender == owner);
        avatarURL = _newURL;
    }

    function setMetadataURL(string calldata _url) external {
        require(msg.sender == owner);
        metadataURL.push(_url);
    }

    function getAllMetadata() public view returns(string[] memory) {
        return metadataURL;
    }
}
