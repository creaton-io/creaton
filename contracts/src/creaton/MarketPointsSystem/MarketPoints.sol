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
    
    mapping(address => bytes16) private artistVectorPoints; //address of creator to the number of points it takes to get to that level
    // Ok, so, this fixed point array is actually a vector, with the nth point representing artistVectorPoints[n](x^n) == points for level x

    
    IERC20 token;
    constructor(IERC20 _tokenAddress){
        token = _tokenAddress;
    }

    /**
     * @dev tips the artist the given amount and gives the user points.
     * @param artist the address of the artist
     * @param amount the amount the user would like to tip.
     */
    function tipArtist (address artist, uint256 amount) public {
        if(token.transferFrom(_msgSender(), artist, amount)){
            _userPoints[artist][_msgSender()] += int128(uint128(amount/(5000000000000000)));
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
     * @dev calculates the amount of points it takes for a user to reach a certain level
     * @param creator the creator address you would like to check
     * @param level the level you would like to check
     * @return the amount of points it takes to reach the level
    */
    function getPointsForLevel(address creator, int128 level) public view returns (int128){
        int128 nextLevelModified = level;
        //you cant explicitly convert from a byte to an int8, so we go through uint8 first
        int128 pointsForLevel = int8(uint8(artistVectorPoints[creator][0]));

        //yes, i could be a uint8, but pointers always run faster than custom sized types.
        for (uint256 i = 0; i < 15; i++) {//you remove the first one to be the power of 0
            // console.log(uint256(artistVectorPoints[creator][i+1]));
            //you can only do one casting at a time, idk why.
            pointsForLevel += int8(uint8(artistVectorPoints[creator][i])) * nextLevelModified;
            nextLevelModified*=level;//basically just raise it to another power.
        }
        console.log(uint256(uint128(pointsForLevel)));
        return pointsForLevel;
    }

    /**
     * @dev sets the leveling math values for an artist.
     * @param levels the 32 uint8s, With the first byte representing x^0...
     */
    function setArtistLevels(bytes16 levels) public{
        // console.log(uint128(levels));//only ever use this remembering that you have to convert the numbers back to hex!
        artistVectorPoints[_msgSender()] = levels;
    }

}

