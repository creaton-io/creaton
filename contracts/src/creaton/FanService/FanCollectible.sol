pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FanCollectible is ERC1155, Ownable {
    using SafeMath for uint256;


    uint256 private _currentTokenID = 0;
    address private _minter; //I was wrong! this is actually *very* important, and needs to be the address of the controlling contract!

    mapping(uint256 => address) public creators;//tokenID to address of artist.
    mapping(uint256 => uint256) public tokenSupply;//tokenID to current supply of tokens



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
        require(tokenSupply[tokenId] < 1, "Max supply reached");
        _mint(_to, _id, 1, _data);
        tokenSupply[_id] = tokenSupply[_id].add(1);
        // sudocode if it is a standard NFT, mint an nft to them
    }

    /**
     * @dev Creates a new token type and assigns _initialSupply to an address
     * @param _initialSupply Optional amount to supply the first owner
     * @param _uri Optional URI for this token type
     * @param _data Optional data to pass if receiver is contract
     * @return tokenId The newly created token ID
     */
    function create(
        uint256 _initialSupply,
        string calldata _uri,
        bytes calldata _data
    ) external onlyMinter() returns (uint256 tokenId) {
        require(_initialSupply == 0 || _initialSupply == 1, "Initial supply for art can only be 0 or 1, as there is a max of 1.");
        uint256 _id = _getNextTokenID();
        _incrementTokenTypeId();
        creators[_id] = msg.sender;

        if (bytes(_uri).length > 0) {
            emit URI(_uri, _id);
        }

        if (_initialSupply == 1) 
            _mint(msg.sender, _id, _initialSupply, _data);
        tokenSupply[_id] = _initialSupply;
        return _id;
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenID
     * @return uint256 for the next token ID
     */
    function _getNextTokenID() private view returns (uint256) {
        return _currentTokenID.add(1);
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
}
