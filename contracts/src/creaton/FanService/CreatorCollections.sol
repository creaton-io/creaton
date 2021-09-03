pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol";
import "./FanCollectible.sol";

contract CreatorCollections is Ownable, Pausable {
    using SafeMath for uint256;
    uint256 private creatonBalance;
    uint256 constant CREATON_PERCENTAGE = 2;
    uint256 constant ARTIST_PERCENTAGE = 100 - CREATON_PERCENTAGE;

    address private newerVersionOfContract; // if this is anything but 0, then there is a newer contract, with, hopefully all of the same data.
    IERC20 public token; // set to the address of USDC, probably, we don't check...
    FanCollectible private collectible;

    uint256 private _totalSupply;
    mapping(address => uint256[]) private accountToPools; // this is just a nicer way of keep track of who owns what pools.

    mapping(uint256 => HoldingTokens) private heldBalances; //tokenID => quantity being held.
    struct HoldingTokens {
        uint256 quantityHeld;
        uint256 pool;
    }
    struct Card {
        uint256[] ids; //Card IDs. would be singular, but each one needs to be unique.
        // IDS can be generated on the fly!!! saving memory and most importantly, gas fees per call!
        uint256 price; // Cost of minting a card in USDC
        uint256 releaseTime; // When the card becomes available for minting
        uint256 idPointOfNextEmpty;
    }

    struct Pool {
        uint256 periodStart; // When the collection launches and starts accepting staking tokens.
        uint256 feesCollected; // Tally of eth collected from cards that require an additional $ to be minted
        address artist;
        string title;
        uint256 cardsInPool;
        Card[] cardsArray;
    }

    address public controller;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(uint256 => Pool) public pools;
    uint256 public poolsCount;

    event UpdatedArtist(uint256 poolId, address artist);
    event PoolAdded(uint256 poolId, address artist, uint256 periodStart);
    event CardAdded(uint256 poolId, uint256[] cardIds, uint256 price, uint256 releaseTime);
    event Staked(address indexed user, uint256 poolId, uint256 amount);
    event Withdrawn(address indexed user, uint256 poolId, uint256 amount);
    event Transferred(address indexed user, uint256 fromPoolId, uint256 toPoolId, uint256 amount);
    event Redeemed(address indexed user, uint256 poolId, uint256 amount);

    modifier poolExists(uint256 id) {
        require(pools[id].periodStart > 0, "pool does not exists");
        _;
    }

    modifier cardExists(uint256 pool, uint256 card) {
        require(card < pools[pool].cardsArray.length, "card may not exist");
        _;
    }

    modifier onlyOwnerOrArtist(uint256 pool) {
        require(
            pools[pool].artist == _msgSender() || _msgSender() == owner(),
            "You Do Not Have Authorization To Change This"
        );
        _;
    }

    constructor(
        address _controller,
        FanCollectible _collectibleAddress,
        IERC20 _tokenAddress
    ) {
        controller = _controller;
        collectible = _collectibleAddress;
        token = IERC20(_tokenAddress);
    }
        public
        whenNotPaused
        cardExists(_poolID, _cardID)
        returns (uint256)
    {
        Pool storage p = pools[_poolID];
        Card memory c = p.cardsArray[_cardID];
        require(block.timestamp >= p.periodStart, "pool not open");

        require(c.idPointOfNextEmpty < c.ids.length, "Token Is Sold Out");

        uint256 moreToTake = c.price;
        _totalSupply = _totalSupply.add(moreToTake);

        token.transferFrom(_msgSender(), address(this), moreToTake);

        p.feesCollected = p.feesCollected.add(c.price);
        // console.log(c.ids[c.idPointOfNextEmpty]);
        
        collectible.mint(_msgSender(), c.ids[c.idPointOfNextEmpty], "");
        heldBalances[c.ids[c.idPointOfNextEmpty]].quantityHeld = c.price;
        heldBalances[c.ids[c.idPointOfNextEmpty]].pool = _poolID;
        c.idPointOfNextEmpty++;
        emit Redeemed(_msgSender(), _poolID, c.price);
        return c.ids[c.idPointOfNextEmpty - 1];
    }


    /**
     * @dev set the artist for the given pool.
     * @param pool the pool you are setting an artist for
     * @param artist the address of the artist.
     */
    function setArtist(uint256 pool, address artist) public onlyOwnerOrArtist(pool) {
        uint256 amount = pendingWithdrawals[pools[pool].artist];
        pendingWithdrawals[pools[pool].artist] = 0;
        pendingWithdrawals[artist] = pendingWithdrawals[artist].add(amount);
        pools[pool].artist = artist;

        // this removes the existing artist reference to this... but seems like it will be expensive...
        for (uint8 x = 0; x < accountToPools[pools[pool].artist].length - 1; x++) {
            if (accountToPools[pools[pool].artist][x] == pool) {
                delete accountToPools[pools[pool].artist][x];
            }
        }
        accountToPools[artist].push(pool);

        emit UpdatedArtist(pool, artist);
    }

    function setController(address _controller) public onlyOwner {
        uint256 amount = pendingWithdrawals[controller];
        pendingWithdrawals[controller] = 0;
        pendingWithdrawals[_controller] = pendingWithdrawals[_controller].add(amount);
        controller = _controller;
    }

    /**
     * @dev creates a card (inside a FanCollectible) for the given pool
     * @param pool the pool id to add it to
     * @param supply the supply of these to be made
     * @param price the cost of each item in price
     * @param releaseTime the time you can start buying these
     */
    function createCard(
        uint256 pool,
        uint256 supply,
        uint256 price,
        uint256 releaseTime
    ) public onlyOwnerOrArtist(pool) poolExists(pool) returns (uint256) {
        uint256[] memory tokenIdsGenerated = new uint256[](supply);
        for (uint256 x = 0; x < supply; x++) {
            tokenIdsGenerated[x] = collectible.create("", ""); //URI and Data seem important... and most likely are! well! HAVE FUN!
            //so this generates all the token IDs that will be used, and makes each one unique.
        }
        pools[pool].cardsArray.push(Card(tokenIdsGenerated, price, releaseTime, 0));

        pools[pool].cardsInPool++;
    }

    /**
    @dev creates a pool.
    @param id the id of the pool. Must be unique.
    @param periodStart the time you can start buying these
    @param title the title of the pool
    */
    function createPool(
        uint256 id,
        uint256 periodStart,
        string memory title
    ) public returns (uint256) {
        require(pools[id].periodStart == 0, "pool exists");

        Pool storage p = pools[id];

        p.periodStart = periodStart;
        p.artist = _msgSender();
        p.title = title;

        poolsCount++;

        accountToPools[_msgSender()].push(id);
        emit PoolAdded(id, _msgSender(), periodStart);
        return id;
    }

    function cardReleaseTime(uint256 pool, uint256 card) public view returns (uint256) {
        return pools[pool].cardsArray[card].releaseTime;
    }

    /**
     * @dev calculates the total suply of tokens that are being staked in this contract
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function cardsInPool(uint256 id) public view returns (uint256) {
        return pools[id].cardsInPool;
    }

    function getCardsArray(uint256 id) public view returns (Card[] memory) {
        return pools[id].cardsArray;
    }

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
    function getNewerContract() public returns (address) {
        return newerVersionOfContract;
    }

    /**
    @dev sets a new contract as the newerVersionOfContract, if theres a newer contract address, you should use that.
    @param _newerContract the address of the newer version of this contract.  
    */
    function setNewerContract(address _newerContract) public onlyOwner {
        newerVersionOfContract = _newerContract;
    }

    /**
    @dev get the pools an address is the artist of, use this to get all the pool ids.
    @param artist the address of the artist you want to find the pools of.
    */
    function getPoolsForArtist(address artist) public view returns (uint256[] memory) {
        uint256[] memory accountsPools = accountToPools[artist];
        return accountsPools;
    }

    /**
    @dev return the data for a FanCollectible and then get the money they have staked.
    @param _pool the pool id
    @param _fanID the id of the FanCollectible you want to get the data for.
    @param _data the URI to the data for the FanCollectible.
    */
    function setFanCollectibleData(
        uint256 _pool,
        uint256 _fanID,
        bytes memory _data
    ) public {
        require(_msgSender() == pools[_pool].artist, "not the artist");

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
