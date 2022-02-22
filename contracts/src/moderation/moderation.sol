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
    uint8 public jurorMaxDaysDeciding;
    uint8 public jurorSlashingPenalty;

    uint8 public constant JUROR_STATUS_IDLE = 1;
    uint8 public constant JUROR_STATUS_ACTIVE = 2;

    uint8 public constant CASE_STATUS_NEW = 1;
    uint8 public constant CASE_STATUS_JURY_ASSIGNED = 2;
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
        mapping(address => uint256) jurorTimestamp;
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
    event JuryAssigned(string contentId, address[] jury);
    event JuryReassigned(string contentId, address[] jury);

    function initialize(address _stakingToken, uint256 _caseStakedThreshold, uint8 _minJurySize, uint8 _jurorMaxDaysDeciding, uint8 _jurorSlashingPenalty) 
        public 
        initializer 
    {
        stakingToken = _stakingToken;
        caseStakedThreshold = _caseStakedThreshold;
        minJurySize = _minJurySize;
        jurorMaxDaysDeciding = _jurorMaxDaysDeciding;
        jurorSlashingPenalty = _jurorSlashingPenalty;
        owner = _msgSender();

        emit Initialized(stakingToken);
    }

    function setConfig(uint256 _caseStakedThreshold, uint8 _minJurySize, uint8 _jurorMaxDaysDeciding, uint8 _jurorSlashingPenalty)
        public 
        onlyOwner
    {
        caseStakedThreshold = _caseStakedThreshold;
        minJurySize = _minJurySize;
        jurorMaxDaysDeciding = _jurorMaxDaysDeciding;
        jurorSlashingPenalty = _jurorSlashingPenalty;
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
        _removeJuror(_msgSender());
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

    function reassignInactiveJurors(string calldata _contentId)
        public
    {
        require(cases[_contentId].status == CASE_STATUS_JURY_ASSIGNED, "Moderation: Case status must be ASSIGNED");

        uint256 _randomNumber;
        uint256 _j = 0;
        address[] memory _selectedJury = new address[](cases[_contentId].jurySize);
        for(uint256 _i=0; _i<cases[_contentId].jurySize; _i++){
            _j = 0;
            address _juror = cases[_contentId].jury[_i];

            if(cases[_contentId].jurorDecision[_juror] == JUROR_DECISION_UNDEFINED 
                && block.timestamp > cases[_contentId].jurorTimestamp[_juror] + jurorMaxDaysDeciding * 1 days){
                    _slashAndRemoveJuror(_juror);

                    do{
                        _randomNumber = _getRandomNumber(_j++);
                        address _selectedJuror = jurorsAddress.at(_randomNumber);

                        if(cases[_contentId].jurorDecision[_selectedJuror] == 0){
                            cases[_contentId].jury[_i] = _selectedJuror;
                            cases[_contentId].jurorDecision[_selectedJuror] = JUROR_DECISION_UNDEFINED;
                            cases[_contentId].jurorTimestamp[_selectedJuror] = block.timestamp;
                        }
                    }while(cases[_contentId].jury[_i] == _juror); // Might trigger out of gas, but that's ok...
            }

            _selectedJury[_i] = cases[_contentId].jury[_i];
        }

        emit JuryReassigned(_contentId, _selectedJury);
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
            _assignJury(_contentId);
        }
    }

    function _assignJury(string calldata _contentId)
        internal
    {
        require(cases[_contentId].status >= CASE_STATUS_NEW, "Moderation: Case must exist to assign a jury");

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
                cases[_contentId].jurorTimestamp[_selectedJuror] = block.timestamp;
            }
        }while(cases[_contentId].jurySize < minJurySize);

        cases[_contentId].status = CASE_STATUS_JURY_ASSIGNED;

        emit JuryAssigned(_contentId, _selectedJury);
    }

    function _slashAndRemoveJuror(address _juror)
        internal
    {
        _removeJuror(_juror);
    }

    function _removeJuror(address _juror)
        internal
    {
        require(jurors[_juror].staked > 0, "Moderation: Address is not a Juror");
        require(jurors[_juror].status == JUROR_STATUS_IDLE, "Moderation: Juror must be idle");

        uint256 _staked = jurors[_juror].staked;
        jurors[_juror] = Juror({ staked: 0, status: JUROR_STATUS_IDLE });
        jurorsAddress.remove(_juror);
        IERC20(stakingToken).safeTransfer(_juror, _staked);

        emit JurorRemoved(_juror, _staked);
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