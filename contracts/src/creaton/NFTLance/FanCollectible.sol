pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol";

contract FanCollectible is ERC1155, Ownable {


    uint256 private _currentTokenID = 0;
    address private _minter; //I was wrong! this is actually *very* important, and needs to be the address of the controlling contract!
    
    enum states {
        UNPURCHASED, 
        PURCHASED, 
        PURCHASED_AND_FINALIZED,
        CONVERTED_TO_ZORA
    }

    mapping(uint256 => states) private stateOfCollectibles; //tokenID to state of collectible.
    mapping(uint256 => string) private collectibleRequestData; //tokenID to data about collectible request.

    constructor(string memory _uri) ERC1155(_uri) {}

    /**
     * @dev Throws if called by any account other than the minter.
     */
    modifier onlyMinter() {
        require(minter() == msg.sender, "Mintable: caller is not the minter");
        _;
    }

    function minter() public view virtual returns (address) {
        return _minter;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferMinter(address newMinter) public virtual onlyOwner {
        require(newMinter != address(0), "Minter: new minter is the zero address");
        emit MinterTransferred(_minter, newMinter);
        _minter = newMinter;
    }

    event MinterTransferred(address indexed previousMinter, address indexed newMinter);
    event TokenAdded(uint256 indexed tokenID);
    event RequestDataSet(uint256 indexed tokenID, string indexed collectibleRequestData);
    /**
     * @dev Mints some amount of tokens to an address
     * @param _to          Address of the future owner of the token
     * @param _id          Token ID to mint
     * @param _data        Data to pass if receiver is contract
     */
    function mint(
        address _to,
        uint256 _id,
        bytes memory _data
    ) public onlyMinter() {
        uint256 tokenId = _id;
        require(stateOfCollectibles[_id] == states.UNPURCHASED, "Max supply reached");
        _mint(_to, _id, 1, _data);
        stateOfCollectibles[_id] = states.PURCHASED;
    }

    /**
     * @dev Creates a new token type and assigns _initialSupply to an address
     * @param _uri Optional URI for this token type
     * @param _data Optional data to pass if receiver is contract
     * @return tokenId The newly created token ID
     */
    function create(
        string calldata _uri,
        bytes calldata _data
    ) external onlyMinter() returns (uint256 tokenId) {
        uint256 _id = _getNextTokenID();
        _incrementTokenTypeId();
        stateOfCollectibles[_id] = states.UNPURCHASED;

        if (bytes(_uri).length > 0) {
            emit URI(_uri, _id);
        }

        return _id;
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenID
     * @return uint256 for the next token ID
     */
    function _getNextTokenID() private view returns (uint256) {
        return _currentTokenID+1;
    }

    /**
     * @dev increments the value of _currentTokenID
     */
    function _incrementTokenTypeId() private {
        _currentTokenID++;
    }

    function getCurrentTokenID() public view returns (uint256) {
        return _currentTokenID;
    }

    /**
     * @dev sets the request data for a collectible
     * @param _id Token ID to set data for
     * @param _request Data to set (graphQL on ceramic's meta data)
    */
    function setRequestData(uint256 _id, string memory _request) public {
        require(stateOfCollectibles[_id] != states.PURCHASED_AND_FINALIZED, "Token has already been finalized");
        // require(stateOfCollectibles[_id] != states.UNPURCHASED, "Token not purchased");
        require(balanceOf(_msgSender(), _id) >=1, "Token not owned by sender");

        collectibleRequestData[_id] = _request;
        emit RequestDataSet(_id, _request);
    }

    /**
    @dev sets the data for a token after it has been approved by the artist
    @param _id Token ID to set data for
    @param _data the data link.
    */
    function finalizedByArtist(uint256 _id, bytes memory _data) onlyMinter() public {
        require(stateOfCollectibles[_id] == states.PURCHASED, "Token not purchased");
        stateOfCollectibles[_id] = states.PURCHASED_AND_FINALIZED;
        //assume the data has modified the NFT, even thought it hasn't *really*

    }
}
