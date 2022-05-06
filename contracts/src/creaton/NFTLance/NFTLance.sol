pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../../dependency/gsn/BaseRelayRecipient.sol";

import "./CreatorCollections.sol";
import "./FanCollectible.sol";

contract NFTLance is Ownable, Pausable, BaseRelayRecipient {
    mapping (address => address) public creatorsCollections;  // deployer(creator) -> CreatorCollections registry
    address public fanCollectibleAddress;

    event DeployedCreatorCollection(address creatorCollections, address fanCollectible, string fanCollectibleURI, address token);

    function deployCreatorCollection(string memory _fanCollectibleURI, IERC20 _tokenAddress, address _trustedForwarder) public {
        FanCollectible _fanCollectible = new FanCollectible(_fanCollectibleURI, _trustedForwarder);
        CreatorCollections _creatorCollections = new CreatorCollections(_fanCollectible, _tokenAddress, _trustedForwarder);

        fanCollectibleAddress = address(_fanCollectible);
        _creatorCollections.transferOwnership(_msgSender());
        _fanCollectible.transferMinter(address(_creatorCollections));
        _fanCollectible.transferOwnership(_msgSender());

        creatorsCollections[_msgSender()] = address(_creatorCollections);

        trustedForwarder = _trustedForwarder;

        emit DeployedCreatorCollection(address(_creatorCollections), address(_fanCollectible), _fanCollectibleURI, address(_tokenAddress));
    }

    function setTrustedForwarder(address _trustedForwarder) public onlyOwner {
        trustedForwarder = _trustedForwarder;
    }

    function versionRecipient() external view virtual override returns (string memory) {
        return "2.2.3-matic";
    }

    function _msgSender() internal view override(Context, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(Context, BaseRelayRecipient)
        returns (bytes memory) {
        return BaseRelayRecipient._msgData();
    }
}