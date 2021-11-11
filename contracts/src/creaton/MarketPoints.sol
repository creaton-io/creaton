pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract MarketPoints is Ownable {
    // using safeMath for uint256;

    //keeping track of the points on the site, this is for internal uses mostly
    mapping(address => uint256) private _siteWidePoints; //address of the user => points the user has for the entire site.
    mapping(address => uint256) private _siteWideLevel; //address of the user => level the user has for the entire site.

    mapping(address => mapping(address => int128)) private _userPoints; //address of the creator => address of the user => points the user has for the Creator.
    mapping(address => mapping(address => int128)) private _userLevel; //address of the creator => address of the user => level the user has for the Creator.
    
    mapping(address => bytes32) private artistVectorPoints; //address of creator to the number of points it takes to get to that level
    // Ok, so, this fixed point array is actually a vector, with the nth point representing artistVectorPoints[n](x^n) == points for level x

    
    IERC20 token;
    constructor(IERC20 _tokenAddress){
        token = _tokenAddress;
    }

    address NFTLanceAddress;
    function setFanServiceAddress(address _NFTLanceAddress) public onlyOwner{
        NFTLanceAddress = _NFTLanceAddress;
    }
    modifier onlyFanService{
        require(msg.sender == NFTLanceAddress);
        _;
    }

    /**
     * @dev tips the artist the given amount and gives the user points.
     * @param artist the address of the artist
     * @param amount the amount the user would like to tip.
     */
    function tipArtist (address artist, uint256 amount) public {
        if(token.transferFrom(_msgSender(), artist, amount)){
            // console.log(uint256(_userPoints[artist][_msgSender()]));//useful for testing!
            // console.log(uint256(uint128((amount/(5000000000000000)))));

            //the amount tipped is converted to cents, then divided by 3, just kinda makes it feel more random.
            //hard coded to improve performance.
            _userPoints[artist][_msgSender()] += int128(uint128(amount/(3000000000000000)));
        }
    }

    /**
     * @dev calculates the level of the user. Warning, only accurate to within one level up!
     * @param creator the address of the creator.
     * @param user the address of the user.
     * @return the level of the user.
     */
    function getLevel(address creator, address user) public view returns (int128){
        int128 pointsForNextLevel = getPointsForLevel(creator, _userLevel[creator][user]+1);
        if (pointsForNextLevel<=int128(_userPoints[creator][user])) {
            return _userLevel[creator][user]+1;
        }
        return _userLevel[creator][user];
    }

    /**
     * @dev returns the current level of the user, un calculated! use in conjunction with getLevel() to see if the user should level!
     * @param creator the address of the creator.
     * @param user the address of the user.
     * @return the level of the user.
     */
    function getCurrentLevel(address creator, address user) public view returns (int128){
        return _userLevel[creator][user];
    }

    function getCurrentPoints(address creator, address user) public view returns (int128){
        return _userPoints[creator][user];
    }

    /**
     * @dev calculates the amount of points it takes for a user to reach a certain level
     * @param creator the creator address you would like to check
     * @param level the level you would like to check
     * @return the amount of points it takes to reach the level
    */
    function getPointsForLevel(address creator, int128 level) public view returns (int128){
        int128 nextLevelModified = level;
        //you cant explicitly convert from a byte to an int16, so we go through uint8 first
        int128 pointsForLevel = int16(uint16(uint8(artistVectorPoints[creator][0]))<<8 | uint16(uint8(artistVectorPoints[creator][1])));

        //yes, i could be a uint8, but pointers always run faster than custom sized types.
        for (uint256 i = 2; i < 32; i+=2) {//you remove the first two bytes, so we start at 2, then increment by two to handle the int16s
            // console.log(uint256(artistVectorPoints[creator][i+1]));
            //you can only do one casting at a time, idk why.
            int16 power = int16(uint16(uint8(artistVectorPoints[creator][i]))<<8 | uint16(uint8(artistVectorPoints[creator][i+1])));

            pointsForLevel += power * nextLevelModified;
            nextLevelModified*=level;//basically just raise it to another power.
        }
        // console.log(uint256(uint128(level)));
        // console.log(uint256(uint128(pointsForLevel)));
        // console.log();
        return pointsForLevel;
    }

    /**
     * @dev sets the leveling math values for an artist.
     * @param levels the 32 uint8s, With the first byte representing x^0...
     */
    function setArtistLevels(bytes32 levels) public{
        // console.log(uint128(levels));//only ever use this remembering that you have to convert the numbers back to hex!
        artistVectorPoints[_msgSender()] = levels;
    }

    /**
     * @dev level up, should only be used when leveling up.
     * @param creator the address of the creator you would like to level up with
     * @return true if the user leveled up!
    */
    function levelUp(address creator) public returns (bool){
        //TODO: have this give a reward if the user levels up!
        if (getPointsForLevel(creator, _userLevel[creator][_msgSender()]+1)<=int128(_userPoints[creator][_msgSender()])) {
            _userLevel[creator][_msgSender()]++;
            return true;
        }
        return false;
    }

    function canLevelUp(address creator, address user) public view returns (bool){
        return getPointsForLevel(creator, _userLevel[creator][user]+1)<=int128(_userPoints[creator][user]);
    }


}

