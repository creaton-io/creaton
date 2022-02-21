// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

contract Moderation is Context, UUPSUpgradeable, Initializable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    address public stakingToken;
    address public owner;
    uint256 public caseStakedThreshold;
    uint8 public minJurySize;

    uint8 public constant JUROR_STATUS_IDLE = 1;
    uint8 public constant JUROR_STATUS_ACTIVE = 2;

    uint8 public constant CASE_STATUS_NEW = 1;
    uint8 public constant CASE_STATUS_JURY_ASIGNED = 2;
    uint8 public constant CASE_STATUS_RULED = 3;

    uint8 public constant JUROR_DECISION_UNDEFINED = 1;
    uint8 public constant JUROR_DECISION_OK = 2;
    uint8 public constant JUROR_DECISION_KO = 3;

    struct Juror {
        uint256 staked;
        uint8 status;
    }

    struct Case {
        uint8 status;
        mapping(address => uint8) jurorDecision;
        mapping(uint256 => address) jury;
        uint256 jurySize;
    }

    struct JurorDecision {
        address juror;
        uint8 decision;
    } 

    EnumerableSet.AddressSet private jurorsAddress;

    mapping (address => Juror) public jurors; // All jurors in the system
    mapping (string => uint256) public reported; // (contentId -> staked) Staked amount in every reported content
    mapping (address => uint256) public reporters; // (address -> staked) Addresses that staked a certain amount in order that report content
    mapping (string => Case) public cases; // contentId -> Case

    event Initialized(address stakingToken);
    event JurorAdded(address juror, uint256 staked);
    event JurorRemoved(address juror, uint256 staked);
    event ContentReported(address reporter, string contentId, uint256 staked);
    event CaseBuilt(string contentId);
    event JuryAsigned(string contentId, address[] jury);

    function initialize(address _stakingToken, uint256 _caseStakedThreshold, uint8 _minJurySize) 
        public 
        initializer 
    {
        stakingToken = _stakingToken;
        caseStakedThreshold = _caseStakedThreshold;
        minJurySize = _minJurySize;
        owner = _msgSender();

        emit Initialized(stakingToken);
    }

    function addJuror(uint256 _stake) 
        public 
    {
        require(jurors[_msgSender()].staked == 0, "Moderation: MsgSender is already a Juror");

        IERC20(stakingToken).safeTransferFrom(_msgSender(), address(this), _stake);
        jurors[_msgSender()] = Juror({ staked: _stake, status: JUROR_STATUS_IDLE });
        jurorsAddress.add(_msgSender());
        emit JurorAdded(_msgSender(), _stake);
    }

    function removeJuror() 
        public 
    {
        require(jurors[_msgSender()].staked > 0, "Moderation: MsgSender is not a Juror");
        require(jurors[_msgSender()].status == JUROR_STATUS_IDLE, "Moderation: Juror must be idle");

        uint256 _staked = jurors[_msgSender()].staked;
        jurors[_msgSender()] = Juror({ staked: 0, status: JUROR_STATUS_IDLE });
        jurorsAddress.remove(_msgSender());
        IERC20(stakingToken).safeTransfer(_msgSender(), _staked);

        emit JurorRemoved(_msgSender(), _staked);
    }

    function reportContent(string calldata _contentId, uint256 _stake)
        public
    {
        IERC20(stakingToken).safeTransferFrom(_msgSender(), address(this), _stake);
        reported[_contentId] += _stake;
        reporters[_msgSender()] += _stake;

        emit ContentReported(_msgSender(), _contentId, _stake);

        if(reported[_contentId] >= caseStakedThreshold){
            _buildCase(_contentId);
        }
    }

    function _buildCase(string calldata _contentId)
        internal
    {
        require(reported[_contentId] >= caseStakedThreshold, "Moderation: Reported content didn't reach the threshold");

        if(cases[_contentId].status == 0){
            Case storage c = cases[_contentId];
            c.status = CASE_STATUS_NEW;
            c.jurySize = 0;
            emit CaseBuilt(_contentId);
        }

        if(cases[_contentId].status == 1){
            _asignJury(_contentId);
        }
    }

    function _asignJury(string calldata _contentId)
        internal
    {
        require(cases[_contentId].status >= CASE_STATUS_NEW, "Moderation: Case must exist to asign a jury");

        if(jurorsAddress.length() < minJurySize){
            return;
        }

        uint256 _i = 0;
        uint256 _randomNumber;
        address[] memory _selectedJury = new address[](minJurySize);
        do{
            _randomNumber = _getRandomNumber(_i++);
            address _selectedJuror = jurorsAddress.at(_randomNumber);
            if(cases[_contentId].jurorDecision[_selectedJuror] == 0){
                _selectedJury[cases[_contentId].jurySize] = _selectedJuror;
                cases[_contentId].jury[cases[_contentId].jurySize] = _selectedJuror;
                cases[_contentId].jurySize++;
                cases[_contentId].jurorDecision[_selectedJuror] = JUROR_DECISION_UNDEFINED;
            }
        }while(cases[_contentId].jurySize < minJurySize);

        cases[_contentId].status = CASE_STATUS_JURY_ASIGNED;

        emit JuryAsigned(_contentId, _selectedJury);
    }

    function _getRandomNumber(uint256 _attempts)
        internal
        view
        returns(uint256)
    {
        uint256 _random = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, block.number, jurorsAddress.values(), _attempts)));
        return _random % jurorsAddress.length();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
    }

    /* ========== MODIFIERS ========== */

    modifier onlyOwner() {
        require(msg.sender == owner, "ReactionFactory: Caller is not owner");
        _;
    }
}