pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol";
import "./FanCollectible.sol";
import "../MarketPoints.sol";

contract CreatorCollections is Ownable, Pausable {
    using SafeMath for uint256;
    uint256 private creatonBalance;
    uint256 constant CREATON_PERCENTAGE = 2;
    uint256 constant ARTIST_PERCENTAGE = 100 - CREATON_PERCENTAGE;

    address private newerVersionOfContract; // if this is anything but 0, then there is a newer contract, with, hopefully all of the same data.
    IERC20 public token; // set to the address of USDC, probably, we don't check...
    FanCollectible private collectible;

    uint256 private _totalSupply;

    mapping(uint256 => HoldingTokens) private heldBalances; //tokenID => quantity being held.
    struct HoldingTokens {
        uint256 quantityHeld;
        uint256 catalog;
    }
    struct Card {
        uint256[] ids; //Card IDs. would be singular, but each one needs to be unique.
        // IDS can be generated on the fly!!! saving memory and most importantly, gas fees per call!
        uint256 price; // Cost of minting a card in USDC
        uint256 releaseTime; // When the card becomes available for minting
        uint256 idPointOfNextEmpty;
    }

    struct Catalog {
        uint256 feesCollected; // Tally of eth collected from cards that require an additional $ to be minted
        address artist;
        string title;
        uint256 cardsInCatalog;
        Card[] cardsArray;
    }

    mapping(address => uint256) public pendingWithdrawals;
    mapping(uint256 => Catalog) public catalogs;
    uint256 public catalogsCount;

    event UpdatedArtist(uint256 catalogId, address artist);
    event CatalogAdded(uint256 catalogId, address artist, uint256 periodStart);
    event CardAdded(uint256 catalogId, uint256[] cardIds, uint256 price, uint256 releaseTime);

    event Redeemed(address indexed user, uint256 catalogId, uint256 amount);

    modifier catalogExists(uint256 id) {
        require(catalogs[id].artist != address(0), "catalog does not exists");
        _;
    }

    modifier cardExists(uint256 catalog, uint256 card) {
        require(card < catalogs[catalog].cardsArray.length, "card may not exist");
        _;
    }

    modifier onlyOwnerOrArtist(uint256 catalog) {
        require(
            catalogs[catalog].artist == _msgSender() || _msgSender() == owner(),
            "You Do Not Have Authorization To Change This"
        );
        _;
    }

    constructor(
        FanCollectible _collectibleAddress,
        IERC20 _tokenAddress
    ) {
        collectible = _collectibleAddress;
        token = IERC20(_tokenAddress);
    }
    MarketPoints public marketPoints;
    function setMarketPoints(MarketPoints _marketPoints) public onlyOwner {
        marketPoints = _marketPoints;
    }
    
    function purchase(uint256 _catalogID, uint256 _cardID)
        public
        whenNotPaused
        cardExists(_catalogID, _cardID)
        returns (uint256)
    {
        Catalog storage p = catalogs[_catalogID];
        Card memory c = p.cardsArray[_cardID];
        require(block.timestamp >= c.releaseTime, "card not open");

        require(c.idPointOfNextEmpty < c.ids.length, "Card Is Sold Out");

        _totalSupply = _totalSupply.add(c.price);

        token.transferFrom(_msgSender(), address(this), c.price);

        p.feesCollected = p.feesCollected.add(c.price);
        
        collectible.mint(_msgSender(), c.ids[c.idPointOfNextEmpty], "");
        heldBalances[c.ids[c.idPointOfNextEmpty]].quantityHeld = c.price;
        heldBalances[c.ids[c.idPointOfNextEmpty]].catalog = _catalogID;

        c.idPointOfNextEmpty++;
        catalogs[_catalogID].cardsArray[_cardID].idPointOfNextEmpty = c.idPointOfNextEmpty;
        emit Redeemed(_msgSender(), _catalogID, c.price);
        return c.ids[c.idPointOfNextEmpty - 1];
    }

    /**
     * @dev creates a card (inside a FanCollectible) for the given catalog
     * @param catalog the catalog id to add it to
     * @param supply the supply of these to be made
     * @param price the cost of each item in price
     * @param releaseTime the time you can start buying these
     */
    function createCard(
        uint256 catalog,
        uint256 supply,
        uint256 price,
        uint256 releaseTime
    ) public onlyOwnerOrArtist(catalog) catalogExists(catalog) returns (uint256) {
        uint256[] memory tokenIdsGenerated = new uint256[](supply);
        for (uint256 x = 0; x < supply; x++) {
            tokenIdsGenerated[x] = collectible.create("", ""); //URI and Data seem important... and most likely are! well! HAVE FUN!
            //so this generates all the token IDs that will be used, and makes each one unique.
        }
        catalogs[catalog].cardsArray.push(Card(tokenIdsGenerated, price, releaseTime, 0));

        catalogs[catalog].cardsInCatalog++;
    }

    /**
    @dev creates a catalog.
    @param id the id of the catalog. Must be unique.
    @param title the title of the catalog
    */
    function createCatalog(
        uint256 id,
        string memory title
    ) public returns (uint256) {
        //TODO: find a better way to check if a catalog is active.
        require(catalogs[id].artist == address(0), "catalog exists");

        Catalog storage p = catalogs[id];

        p.artist = _msgSender();
        p.title = title;

        catalogsCount++;

        emit CatalogAdded(id, _msgSender(), block.timestamp);
        return id;
    }

    function cardReleaseTime(uint256 catalog, uint256 card) public view returns (uint256) {
        return catalogs[catalog].cardsArray[card].releaseTime;
    }

    /**
     * @dev calculates the total supply of tokens that are being staked in this contract
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function cardsInCatalog(uint256 id) public view returns (uint256) {
        return catalogs[id].cardsInCatalog;
    }

    function getCardsArray(uint256 id) public view returns (Card[] memory) {
        return catalogs[id].cardsArray;
    }

    /**
     * @dev called by the artist for them to get their money out of the contract!   
     */
    function withdrawFee() public {
        uint256 amount = pendingWithdrawals[_msgSender()].mul(ARTIST_PERCENTAGE).div(100);
        require(amount > 0, "nothing to withdraw");
        creatonBalance = creatonBalance.add(pendingWithdrawals[_msgSender()].mul(CREATON_PERCENTAGE).div(100));
        pendingWithdrawals[_msgSender()] = 0;
        token.transfer(_msgSender(), amount);
    }

    /**
    @dev returns the address of a newer version of this contract
    @return newerVersionOfContract, the address of the newer contract.
     */
    function getNewerContract() public view returns (address) {
        return newerVersionOfContract;
    }

    /**
    @dev sets a new contract as the newerVersionOfContract, if theres a newer contract address, you should use that.
    @param _newerContract the address of the newer version of this contract.  
    */
    function setNewerContract(address _newerContract, string calldata versionName) public onlyOwner {
        //TODO: make this use an emit event to let the frontend team know theres a newer version of this contract.
        newerVersionOfContract = _newerContract;
    }

    /**
    @dev return the data for a FanCollectible and then get the money they have staked.
    @param _catalog the catalog id
    @param _fanID the id of the FanCollectible you want to get the data for.
    @param _data the URI to the data for the FanCollectible.
    */
    function setFanCollectibleData(
        uint256 _catalog,
        uint256 _fanID,
        bytes memory _data
    ) public {
        require(_msgSender() == catalogs[_catalog].artist, "not the artist");

        pendingWithdrawals[_msgSender()] = pendingWithdrawals[_msgSender()].add(heldBalances[_fanID].quantityHeld);
        heldBalances[_fanID].quantityHeld = 0;

        collectible.finalizedByArtist(_fanID, _data);
        //TODO: have an emit here that changes the data at the link of the fan collectible to this data.
    }

    function getCreatonCut(address recipient) public onlyOwner {
        token.transfer(recipient, creatonBalance);
        creatonBalance = 0;
    }
}
