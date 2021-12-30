pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./CreatorCollections.sol";
import "./FanCollectible.sol";

contract NFTLance is Ownable, Pausable {
    mapping (address => address) public creatorsCollections;  // deployer(creator) -> CreatorCollections registry

    event DeployedCreatorCollection(address creatorCollections, address fanCollectible, string fanCollectibleURI, address token);

    function deployCreatorCollection(string memory _fanCollectibleURI, IERC20 _tokenAddress) public {
        FanCollectible _fanCollectible = new FanCollectible(_fanCollectibleURI);
        CreatorCollections _creatorCollections = new CreatorCollections(_fanCollectible, _tokenAddress);

        _creatorCollections.transferOwnership(_msgSender());
        _fanCollectible.transferMinter(address(_creatorCollections));
        _fanCollectible.transferOwnership(_msgSender());

        creatorsCollections[_msgSender()] = address(_creatorCollections);

        emit DeployedCreatorCollection(creatorsCollections[_msgSender()], address(_fanCollectible), _fanCollectibleURI, address(_tokenAddress));
    }
}