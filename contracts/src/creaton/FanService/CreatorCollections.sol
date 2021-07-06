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

    struct Card {
        uint256 id; //Card ID
        uint256 price; // Cost of minting a card in USDC
        uint256 releaseTime; // When the card becomes available for minting
        uint256 mintFee; // Cost of minting a card in eth
    }

    struct Pool {
        uint256 periodStart; // When the collection launches and starts accepting staking tokens.
        uint256 maxStake; // How many tokens you can stake max on the pool.
        uint256 feesCollected; // Tally of eth collected from cards that require an additional $ to be minted
        uint256 controllerShare; // Revenue share scheme of eth fees collected
        address artist;
        string title;
        mapping(address => uint256) lastUpdateTime;
        mapping(uint256 => Card) cards;
        uint256 cardsInPool;
        Card[] cardsArray;
    }

    address public controller;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(uint256 => Pool) public pools;
    uint256 public poolsCount;

    event UpdatedArtist(uint256 poolId, address artist);
    event PoolAdded(uint256 poolId, address artist, uint256 periodStart, uint256 maxStake);
    event CardAdded(uint256 poolId, uint256 cardId, uint256 price, uint256 mintFee, uint256 releaseTime);
    event Staked(address indexed user, uint256 poolId, uint256 amount);
    event Withdrawn(address indexed user, uint256 poolId, uint256 amount);
    event Transferred(address indexed user, uint256 fromPoolId, uint256 toPoolId, uint256 amount);
    event Redeemed(address indexed user, uint256 poolId, uint256 amount);

    modifier poolExists(uint256 id) {
        require(pools[id].periodStart > 0, "pool does not exists");
        _;
    }

    modifier cardExists(uint256 pool, uint256 card) {
        require(pools[pool].cards[card].id > 0, "card does not exists");
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

    /**
     * @dev stake tokens that are held in escro.
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
        require(amount.add(balanceOf(msg.sender, pool)) <= p.maxStake, "stake exceeds max");

        _totalSupply = _totalSupply.add(amount);
        _poolBalances[pool] = _poolBalances[pool].add(amount);
        _accountBalances[msg.sender] = _accountBalances[msg.sender].add(amount);
        _balances[pool][msg.sender] = _balances[pool][msg.sender].add(amount);
        token.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, pool, amount);
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
     * @param pool the pool you are redeming from
     * @param card the card from this pool you are redeeming
     */
    function redeem(uint256 pool, uint256 card)
        public
        payable
        poolExists(pool)
        cardExists(pool, card)
    {
        Pool storage p = pools[pool];
        Card memory c = p.cards[card];
        // console.log("Points needed: ", c.points);
        // console.log("Points:", p.points[msg.sender]);

        require(block.timestamp >= c.releaseTime, "card not released");
        // require(p.points[msg.sender] >= c.points, "not enough points");
        require(msg.value == c.mintFee, "support our artists, send eth");

        if (c.mintFee > 0) {
            uint256 _controllerShare = msg.value.mul(p.controllerShare).div(1000);
            uint256 _artistRoyalty = msg.value.sub(_controllerShare);
            require(_artistRoyalty.add(_controllerShare) == msg.value, "problem with fee");

            p.feesCollected = p.feesCollected.add(c.mintFee);
            pendingWithdrawals[controller] = pendingWithdrawals[controller].add(_controllerShare);
            pendingWithdrawals[p.artist] = pendingWithdrawals[p.artist].add(_artistRoyalty);
        }

        _balances[pool][msg.sender] = _balances[pool][msg.sender].sub(c.price);
        collectible.mint(msg.sender, card, 1, "");
        emit Redeemed(msg.sender, pool, c.price);
    }

    /**
     * @dev set the artist for the given pool.
     * @param pool the pool you are setting an artist for
     * @param artist the address of the artist.
     */
    function setArtist(uint256 pool, address artist) public onlyOwner {
        uint256 amount = pendingWithdrawals[artist];
        pendingWithdrawals[artist] = 0;
        pendingWithdrawals[artist] = pendingWithdrawals[artist].add(amount);
        pools[pool].artist = artist;

        emit UpdatedArtist(pool, artist);
    }

    function setController(address _controller) public onlyOwner {
        uint256 amount = pendingWithdrawals[controller];
        pendingWithdrawals[controller] = 0;
        pendingWithdrawals[_controller] = pendingWithdrawals[_controller].add(amount);
        controller = _controller;
    }

    function setControllerShare(uint256 pool, uint256 _controllerShare) public onlyOwner poolExists(pool) {
        pools[pool].controllerShare = _controllerShare;
    }

    /**
     * @dev creates a card (inside a FanCollectible) for the given pool
     * @param pool the pool id to add it to
     * @param supply the supply of these to be made
     * @param price the cost of each item in price
     * @param mintFee the additional cost to mint each card (in ETH?)
     * @param releaseTime the time you can start buying these
     */
    function createCard(
        uint256 pool,
        uint256 supply,
        uint256 price,
        uint256 mintFee,
        uint256 releaseTime
    ) public onlyOwner poolExists(pool) returns (uint256) {
        uint256 tokenId = collectible.create(supply, 0, "", "");
        require(tokenId > 0, "ERC1155 create did not succeed");

        Card storage c = pools[pool].cards[tokenId];
        c.price = price;
        c.releaseTime = releaseTime;
        c.mintFee = mintFee;
        c.id = tokenId;
        pools[pool].cardsArray.push(c);
        pools[pool].cardsInPool++;
        emit CardAdded(pool, tokenId, price, mintFee, releaseTime);
        return tokenId;
    }

    function createPool(
        uint256 id,
        uint256 periodStart,
        uint256 maxStake,
        uint256 controllerShare,
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
        p.controllerShare = controllerShare;
        p.artist = artist;
        p.title = title;

        poolsCount++;
        emit PoolAdded(id, artist, periodStart, maxStake);
    }

    function cardMintFee(uint256 pool, uint256 card) public view returns (uint256) {
        return pools[pool].cards[card].mintFee;
    }

    function cardReleaseTime(uint256 pool, uint256 card) public view returns (uint256) {
        return pools[pool].cards[card].releaseTime;
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

    function getLastUpdate(address account, uint256 id) public view returns (uint256) {
        return pools[id].lastUpdateTime[account];
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
    function setNewerContract(address _newerContract) onlyOwner {
        newerVersionOfContract = _newerContract;
    }
}
