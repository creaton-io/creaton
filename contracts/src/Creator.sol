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

    event NewSubscriber(
        address user, 
        uint256 amount);

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    struct Balance {
        uint256 amount;
        bool isSubscribed;
    }
    string[] public metadataURL;
    address public creator ;
    string public avatarURL;
    string public creatorTitle;
    uint256 public subscriptionPrice;
    mapping(address => Balance) public currentBalance;

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

    modifier onlyCreator(){
        require(msg.sender == creator, 'You are not the creator');
        _;
    }

    function subscribe(uint256 _amount) external returns (bool) {
        require(_amount != 0, "Missing subscription amount");
        require(msg.sender != creator, "Creators can't subscribe to themselves");
        require(currentBalance[msg.sender].isSubscribed == false, "Already subscribed");
        currentBalance[msg.sender] = Balance({amount: _amount, isSubscribed: true});  
        emit NewSubscriber(msg.sender, _amount);
        return true;
    }

    function setAvatarURL(string calldata _newURL) external onlyCreator {
        avatarURL = _newURL;
    }

    function setMetadataURL(string calldata _url) external onlyCreator {
        metadataURL.push(_url);
    }

    function getAllMetadata() public view returns(string[] memory) {
        return metadataURL;
    }
}
