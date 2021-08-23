pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol";
import "./FanCollectible.sol";

contract CreatorCollections is Ownable, Pausable {
    using SafeMath for uint256;
    address private newerVersionOfContract;// if this is anything but 0, then there is a newer contract, with, hopefully all of the same data.
    IERC20 public token;// set to the address of USDC, probobly, we dont check...
    FanCollectible public collectible;


    uint256 private _totalSupply;
    mapping(uint256 => mapping(address => uint256)) internal _balances;
    mapping(address => uint256) private _accountBalances;
    mapping(uint256 => uint256) private _poolBalances;
    mapping(address => uint256[]) private accountToPools;// this is just a nicer way of keep track of who owns what pools.
    
    mapping(uint256 => HoldingTokens) private heldBalances;//tokenID => quantity being held.
    struct HoldingTokens{
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
        uint256 maxStake; // How many tokens you can stake max on the pool.
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
    event PoolAdded(uint256 poolId, address artist, uint256 periodStart, uint256 maxStake);
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

    modifier onlyOwnerOrArtist(uint256 pool){
        require(pools[pool].artist == _msgSender() || _msgSender() == owner(), "You Do Not Have Authorization To Change This");
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

    function purchase(uint256 _poolID, uint256 _cardID) 
        public
        whenNotPaused()
        cardExists(_poolID, _cardID)
    returns (uint256){
        Pool storage p = pools[_poolID];
        Card memory c = p.cardsArray[_cardID];
        require(block.timestamp >= p.periodStart, "pool not open");
        require(c.price.add(balanceOf(_msgSender(), _poolID)) <= p.maxStake, "stake exceeds max");
        
        require(c.idPointOfNextEmpty<c.ids.length, "Token Is Sold Out");
        if (_accountBalances[_msgSender()] >= c.price){
            return _redeem(_poolID, _cardID);
        }
        uint256 moreToTake = c.price - _accountBalances[_msgSender()];
        _totalSupply = _totalSupply.add(moreToTake);

        _poolBalances[_poolID] = _poolBalances[_poolID].add(moreToTake);
        _accountBalances[_msgSender()] = 0;
        _balances[_poolID][_msgSender()] = 0;
        token.transferFrom(_msgSender(), address(this), moreToTake);

        p.feesCollected = p.feesCollected.add(c.price);
    
        collectible.mint(_msgSender(), c.ids[c.idPointOfNextEmpty], "");
        heldBalances[c.ids[c.idPointOfNextEmpty]].quantityHeld = c.price;
        heldBalances[c.ids[c.idPointOfNextEmpty]].pool = _poolID;
        c.idPointOfNextEmpty++;
        emit Redeemed(_msgSender(), _poolID, c.price);

        return c.ids[c.idPointOfNextEmpty-1];
    }

    /**
     * @dev stake tokens that are held in escrow.
     * @param pool the id of the pool to stake to.
     * @param amount the amount of the accepted token you wish to stake.
     */
    function stake(uint256 pool, uint256 amount)
        public
        poolExists(pool)
        whenNotPaused()
    {
        Pool storage p = pools[pool];
        require(block.timestamp >= p.periodStart, "pool not open");
        require(amount.add(balanceOf(_msgSender(), pool)) <= p.maxStake, "stake exceeds max");

        _totalSupply = _totalSupply.add(amount);
        _poolBalances[pool] = _poolBalances[pool].add(amount);
        _accountBalances[_msgSender()] = _accountBalances[_msgSender()].add(amount);
        _balances[pool][_msgSender()] = _balances[pool][_msgSender()].add(amount);
        token.transferFrom(_msgSender(), address(this), amount);
        emit Staked(_msgSender(), pool, amount);
    }

    /**
     * @dev withdraw an amount from the senders stake
     * @param pool the pool you are withdrawing from
     * @param amount the amount you are withdrawing
     */
    function withdraw(uint256 pool, uint256 amount) public poolExists(pool){
        require(amount > 0, "cannot withdraw 0");

        _totalSupply = _totalSupply.sub(amount);
        _poolBalances[pool] = _poolBalances[pool].sub(amount);
        _accountBalances[msg.sender] = _accountBalances[msg.sender].sub(amount);
        _balances[pool][msg.sender] = _balances[pool][msg.sender].sub(amount);
        token.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, pool, amount);
    }

    /**
     * @dev withdraws all from a pool
     * @param pool the pool you are withdrawing all from
     */
    function exit(uint256 pool) external {
        withdraw(pool, balanceOf(msg.sender, pool));
    }

    /**
     * @dev redeem a FanCollectible from a pool and send it to the sender.
     * @param pool the pool you are redeeming from
     * @param card the card from this pool you are redeeming
     */
    function redeem(uint256 pool, uint256 card)
        public
        payable
        poolExists(pool)
        cardExists(pool, card)
        returns (uint256)
    {
        Pool storage p = pools[pool];
        Card memory c = p.cardsArray[card];

        require(block.timestamp >= c.releaseTime, "card not released");
        require(_balances[pool][_msgSender()] >= c.price, "not enough tokens stakes");

        require(c.idPointOfNextEmpty<c.ids.length, "Token Is Sold Out");

        return _redeem(pool, card);
    }
    /**
     * @dev private version of redeem, only use if you have checked that redeem should work!
     * @param pool the pool you are redeeming from
     * @param card the card from this pool you are redeeming
     */
    function _redeem(uint256 pool, uint256 card)
        private
        returns (uint256)
    {
        Pool storage p = pools[pool];
        Card memory c = p.cardsArray[card];

        p.feesCollected = p.feesCollected.add(c.price);
    
        _balances[pool][_msgSender()] = _balances[pool][_msgSender()].sub(c.price);
        collectible.mint(_msgSender(), c.ids[c.idPointOfNextEmpty], "");
        heldBalances[c.ids[c.idPointOfNextEmpty]].quantityHeld = c.price;
        heldBalances[c.ids[c.idPointOfNextEmpty]].pool = pool;
        c.idPointOfNextEmpty++;
        emit Redeemed(_msgSender(), pool, c.price);

        return c.ids[c.idPointOfNextEmpty-1];
    }

    /**
     * @dev set the artist for the given pool.
     * @param pool the pool you are setting an artist for
     * @param artist the address of the artist.
     */
    function setArtist(
        uint256 pool, 
        address artist
    ) 
        public 
        onlyOwnerOrArtist(pool) 
    {
        
        uint256 amount = pendingWithdrawals[artist];
        pendingWithdrawals[artist] = 0;
        pendingWithdrawals[artist] = pendingWithdrawals[artist].add(amount);
        pools[pool].artist = artist;

        // this removes the existing artist reference to this... but seems like it will be expensive...
        for (uint8 x = 0; x < accountToPools[pools[pool].artist].length-1; x++){
            if (accountToPools[pools[pool].artist][x] == pool){
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
    ) 
        public 
        onlyOwnerOrArtist(pool) 
        poolExists(pool) 
        returns (uint256) 
    {
        
        uint256[] memory tokenIdsGenerated = new uint256[](supply);
        for (uint256 x = 0; x < supply; x++){
            tokenIdsGenerated[x] = collectible.create("", "");//URI and Data seem important... and most likely are! well! HAVE FUN!
            //so this generates all the token IDs that will be used, and makes each one unique.
        }
        pools[pool].cardsArray.push(Card(tokenIdsGenerated, price, releaseTime, 0));
        
        pools[pool].cardsInPool++;
        // emit CardAdded(pool, tokenIdsGenerated, price, releaseTime);
        // console.log(pools[pool].cardsInPool-1);
        // console.log(tokenIdsGenerated);
        return pools[pool].cardsInPool-1;
    }

    /**
    @dev creates a pool.
    @param id the id of the pool. Must be unique.
    @param periodStart the time you can start buying these
    @param maxStake the maximum amount you can stake(if 0, defaults to 1e^18)
    @param artist the artist that will be paid
    @param title the title of the pool
    */
    function createPool(
        uint256 id,
        uint256 periodStart,
        uint256 maxStake,
        address artist,
        string memory title
    ) public onlyOwner returns (uint256) {
        require(pools[id].periodStart == 0, "pool exists");
		if (maxStake==0){
			maxStake = 1e18;
		}

        Pool storage p = pools[id];

        p.periodStart = periodStart;
        p.maxStake = maxStake;
        p.artist = artist;
        p.title = title;

        poolsCount++;

        accountToPools[artist].push(id);
        emit PoolAdded(id, artist, periodStart, maxStake);
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

    function balanceOfAccount(address account) public view returns (uint256) {
        return _accountBalances[account];
    }

    function balanceOfPool(uint256 id) public view returns (uint256) {
        return _poolBalances[id];
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        return _balances[id][account];
    }

    function cardsInPool(uint256 id) public view returns (uint256) {
        return pools[id].cardsInPool;
    }

    function getCardsArray(uint256 id) public view returns (Card[] memory) {
        return pools[id].cardsArray;
    }

    function withdrawFee() public {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "nothing to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
    @dev returns the address of a newer version of this contract
    @return newerVersionOfContract, the address of the newer contract.
     */
    function getNewerContract() public returns (address){
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
    function getPoolsForArtist(address artist) public view returns (uint256[] memory){
        uint256[] memory accountsPools = accountToPools[artist];
        return accountsPools;
    }

    /**
    @dev return the data for a FanCollectible and then get the money they have staked.
    @param _pool the pool id
    @param _fanID the id of the FanCollectible you want to get the data for.
    @param _data the URI to the data for the FanCollectible.
    */
    function setFanCollectibleData(uint256 _pool, uint256 _fanID, bytes memory _data) public{
        require(_msgSender() == pools[_pool].artist, "not the artist");
        
        pendingWithdrawals[_msgSender()] = pendingWithdrawals[_msgSender()].add(heldBalances[_fanID].quantityHeld);
        heldBalances[_fanID].quantityHeld = 0;

        collectible.finalizedByArtist(_fanID, _data);
        //TODO: have an emit here that changes the data at the link of the fan collectible to this data.
    }
}