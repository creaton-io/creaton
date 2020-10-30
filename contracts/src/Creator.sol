// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "./utils/SafeMath.sol";
import "hardhat/console.sol";

// commenting this import out for now because its causing compilation errors
// import "./ERC1155/ERC1155MixedFungibleMintable.sol";

//import "openzeppelin-solidity/contracts/presets/ERC1155PresetMinterPauser.sol";

contract Creator is Proxied {
    using SafeMath for uint256;
    // -----------------------------------------
    // Events
    // -----------------------------------------

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    string[] public metadataURL;
    address public creator ;
    string public avatarURL;
    string public creatorTitle;
    uint256 public subscriptionPrice;

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    function init(
        string calldata _avatarURL,
        string calldata _creatorTitle,
        uint256 _subscriptionPrice
    ) public {
        creator = msg.sender;
        avatarURL = _avatarURL;
        creatorTitle = _creatorTitle;
        subscriptionPrice = _subscriptionPrice;
    }

    // -----------------------------------------
    // External Functions
    // -----------------------------------------

    function setAvatarURL(string calldata _newURL) external {
        require(msg.sender == creator);
        avatarURL = _newURL;
    }

    function setMetadataURL(string calldata _url) external {
        require(msg.sender == creator);
        metadataURL.push(_url);
    }

    function getAllMetadata() public view returns(string[] memory) {
        return metadataURL;
    }
}
