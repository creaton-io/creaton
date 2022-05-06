// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@opengsn/contracts/src/BaseRelayRecipient.sol";

contract Moderation is Initializable, UUPSUpgradeable, ContextUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, BaseRelayRecipient {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    address public stakingToken;
    uint256 public caseStakedThreshold;
    uint256 public minJurorStake;
    uint8 public minJurySize;
    uint8 public jurorMaxDaysDeciding;
    uint8 public jurorPenaltyPercentage;
    uint8 public jurorProfitPercentage;
    uint8 public reporterPenaltyPercentage;
    uint8 public reporterProfitPercentage;

    uint256 public treasuryBalance;

    uint8 public constant JUROR_STATUS_IDLE = 1;
    uint8 public constant JUROR_STATUS_ACTIVE = 2;

    uint8 public constant CASE_STATUS_NEW = 1;
    uint8 public constant CASE_STATUS_JURY_ASSIGNED = 2;
    uint8 public constant CASE_STATUS_RULED = 3;
    uint8 public constant CASE_STATUS_REWARDED = 4;

    uint8 public constant JUROR_DECISION_UNDEFINED = 1;
    uint8 public constant JUROR_DECISION_OK = 2;
    uint8 public constant JUROR_DECISION_KO = 3;

    struct Juror {
        uint256 initialStaked;
        uint256 staked;
        uint8 status;
    }

    struct Reported {
        uint256 staked;
        uint256 reportersSize;
        mapping(uint256 => address) reporters;
        mapping(address => uint256) stakedByReporter;
    }

    struct Case {
        uint8 status;
        mapping(address => uint8) jurorDecision;
        mapping(address => uint256) jurorTimestamp;
        mapping(uint256 => address) jury;
        uint256 jurySize;
        uint256 pendingVotes;
    }

    struct JurorDecision {
        address juror;
        uint8 decision;
    } 

    struct Rewards {
        address[] jury;
        address[] reporters;
        uint256[] juryRewards;
        uint256[] reportersRewards;
        uint256[] reportersPenalty;
        uint256 totalJuryRewards;
        uint256 totalReportersRewards;
        uint256 totalReportersPenalty;
    }

    EnumerableSetUpgradeable.AddressSet private jurorsAddress;

    mapping (string => Reported) public reported; // contentId -> Reported
    mapping (address => Juror) public jurors; // All jurors in the system
    mapping (string => Case) public cases; // contentId -> Case

    event Initialized(address stakingToken);
    event JurorAdded(address juror, uint256 staked);
    event JurorRemoved(address juror, uint256 staked);
    event JurorSlashed(address juror, uint256 penalty);
    event JurorVoted(address juror, string contentId, uint256 vote);
    event ContentReported(address reporter, string contentId, uint256 staked, string fileProof);
    event CaseBuilt(string contentId, uint256 timestamp);
    event CaseClosed(string contentId, uint8 votedOK, uint8 votedKO);
    event CaseRewardsDistributed(string contentId, address[] jury, address[] reporters, uint256[] juryRewards, uint256[] reportersRewards, uint256[] reportersPenalty, uint256 totalJuryRewards, uint256 totalReportersRewards, uint256 totalReportersPenalty);
    event JuryAssigned(string contentId, address[] jury, uint256 timestamp);
    event JuryReassigned(string contentId, address[] jury, uint256 timestamp);

    function initialize(
        address _stakingToken, 
        uint256 _caseStakedThreshold, 
        uint8 _minJurySize, 
        uint256 _minJurorStake, 
        uint8 _jurorMaxDaysDeciding, 
        uint8 _jurorPenaltyPercentage, 
        uint8 _jurorProfitPercentage, 
        uint8 _reporterPenaltyPercentage, 
        uint8 _reporterProfitPercentage,
        address _trustedForwarder
    ) 
        external 
        initializer 
    {
        require(_stakingToken != address(0), "StakingToken: Host Address can't be 0x");
        OwnableUpgradeable.__Ownable_init();
        ReentrancyGuardUpgradeable.__ReentrancyGuard_init();

        stakingToken = _stakingToken;
        caseStakedThreshold = _caseStakedThreshold;
        minJurySize = _minJurySize;
        minJurorStake = _minJurorStake;
        jurorMaxDaysDeciding = _jurorMaxDaysDeciding;
        jurorPenaltyPercentage = _jurorPenaltyPercentage;
        jurorProfitPercentage = _jurorProfitPercentage;
        reporterPenaltyPercentage = _reporterPenaltyPercentage;
        reporterProfitPercentage = _reporterProfitPercentage;
        _setTrustedForwarder(_trustedForwarder);

        emit Initialized(stakingToken);
    }

    function setConfig(
        uint256 _caseStakedThreshold, 
        uint8 _minJurySize, 
        uint8 _jurorMaxDaysDeciding, 
        uint8 _jurorPenaltyPercentage, 
        uint8 _jurorProfitPercentage, 
        uint8 _reporterPenaltyPercentage, 
        uint8 _reporterProfitPercentage
    )
        external 
        onlyOwner
    {
        caseStakedThreshold = _caseStakedThreshold;
        minJurySize = _minJurySize;
        jurorMaxDaysDeciding = _jurorMaxDaysDeciding;
        jurorPenaltyPercentage = _jurorPenaltyPercentage;
        jurorProfitPercentage = _jurorProfitPercentage;
        reporterPenaltyPercentage = _reporterPenaltyPercentage;
        reporterProfitPercentage = _reporterProfitPercentage;
    }

    function addJuror(uint256 _stake) 
        external 
    {
        require(jurors[_msgSender()].staked == 0, "Moderation: MsgSender is already a Juror");
        require(_stake >= minJurorStake, "Moderation: Min. stake not sent");

        IERC20Upgradeable(stakingToken).safeTransferFrom(_msgSender(), address(this), _stake);
        jurors[_msgSender()] = Juror({ initialStaked: _stake, staked: _stake, status: JUROR_STATUS_IDLE });
        jurorsAddress.add(_msgSender());
        emit JurorAdded(_msgSender(), _stake);
    }

    function removeJuror() 
        external 
    {
        _removeJuror(_msgSender());
    }

    function reportContent(string calldata _contentId, uint256 _stake, string calldata _fileProof)
        external
    {
        IERC20Upgradeable(stakingToken).safeTransferFrom(_msgSender(), address(this), _stake);

        Reported storage r = reported[_contentId];
        r.staked += _stake;

        if(r.stakedByReporter[_msgSender()] == 0){
            r.reporters[r.reportersSize] = _msgSender();
            r.reportersSize += 1;
        }
        r.stakedByReporter[_msgSender()] += _stake;

        emit ContentReported(_msgSender(), _contentId, _stake, _fileProof);

        if(r.staked >= caseStakedThreshold){
            _buildCase(_contentId);
        }
    }

    function vote(string calldata _contentId, uint8 _vote)
        external
    {
        address _juror = _msgSender();
        require(_vote >= JUROR_DECISION_OK && _vote <= JUROR_DECISION_KO, "Moderation: Invalid vote value");
        require(jurors[_juror].staked > 0, "Moderation: Address is not a Juror");
        require(cases[_contentId].status == CASE_STATUS_JURY_ASSIGNED, "Moderation: Case status must be ASSIGNED");
        require(cases[_contentId].pendingVotes >= 0, "Moderation: No pending votes");

        cases[_contentId].jurorDecision[_juror] = _vote;
        cases[_contentId].pendingVotes--;
        jurors[_juror].status = JUROR_STATUS_IDLE;
        
        if(cases[_contentId].pendingVotes == 0){
            closeCase(_contentId);
        }

        emit JurorVoted(_juror, _contentId, _vote);
    }

    function reassignInactiveJurors(string calldata _contentId)
        external
        nonReentrant
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
                    jurors[_juror].status = JUROR_STATUS_IDLE;
                    _slashAndRemoveJuror(_juror);

                    do{
                        _randomNumber = _getRandomNumber(_j++);
                        address _selectedJuror = jurorsAddress.at(_randomNumber);

                        if(cases[_contentId].jurorDecision[_selectedJuror] == 0){
                            cases[_contentId].jury[_i] = _selectedJuror;
                            cases[_contentId].jurorDecision[_selectedJuror] = JUROR_DECISION_UNDEFINED;
                            cases[_contentId].jurorTimestamp[_selectedJuror] = block.timestamp;
                            jurors[_selectedJuror].status = JUROR_STATUS_ACTIVE;
                        }
                    }while(cases[_contentId].jury[_i] == _juror); // Might trigger out of gas, but that's ok...
            }

            _selectedJury[_i] = cases[_contentId].jury[_i];
        }

        emit JuryReassigned(_contentId, _selectedJury, block.timestamp);
    }

    function closeCase(string calldata _contentId)
        public
    {
        require(cases[_contentId].status == CASE_STATUS_JURY_ASSIGNED, "Moderation: Case status must be ASSIGNED");
        require(cases[_contentId].pendingVotes == 0, "Moderation: All jury must vote");

        cases[_contentId].status = CASE_STATUS_RULED;

        address _juror;
        uint8 _votedOK = 0;
        uint8 _votedKO = 0;
        for(uint256 _i=0; _i<cases[_contentId].jurySize; _i++){
            _juror = cases[_contentId].jury[_i];

            if(cases[_contentId].jurorDecision[_juror] == JUROR_DECISION_OK){
                _votedOK++;
            }else if(cases[_contentId].jurorDecision[_juror] == JUROR_DECISION_KO){
                _votedKO++;
            }
        }

        _distributeRewards(_contentId, _votedOK > _votedKO);

        emit CaseClosed(_contentId, _votedOK, _votedKO);
    }

    function fundTreasury(uint256 _amount)
        external
    {
        IERC20Upgradeable(stakingToken).safeTransferFrom(_msgSender(), address(this), _amount);
        treasuryBalance += _amount;
    }

    function withdraw()
        external
        onlyOwner
        nonReentrant
    {
        IERC20Upgradeable(stakingToken).safeTransfer(owner(), treasuryBalance);
        treasuryBalance = 0;
    }

    function getUserReportStakedByContent(string calldata _contentId, address _user)
        external
        view
        returns(uint256)
    {
        return reported[_contentId].stakedByReporter[_user];
    }

    function _buildCase(string calldata _contentId)
        internal
    {
        require(reported[_contentId].staked >= caseStakedThreshold, "Moderation: Reported content didn't reach the threshold");

        if(cases[_contentId].status == 0){
            Case storage c = cases[_contentId];
            c.status = CASE_STATUS_NEW;
            c.jurySize = 0;
            c.pendingVotes = 0;
            emit CaseBuilt(_contentId, block.timestamp);
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
                cases[_contentId].pendingVotes++;
                cases[_contentId].jurorDecision[_selectedJuror] = JUROR_DECISION_UNDEFINED;
                cases[_contentId].jurorTimestamp[_selectedJuror] = block.timestamp;
                jurors[_selectedJuror].status = JUROR_STATUS_ACTIVE;
            }
        }while(cases[_contentId].jurySize < minJurySize);

        cases[_contentId].status = CASE_STATUS_JURY_ASSIGNED;
        emit JuryAssigned(_contentId, _selectedJury, block.timestamp);
    }

    function _slashAndRemoveJuror(address _juror)
        internal
    {
        uint256 _penalty = (jurors[_juror].staked*jurorPenaltyPercentage)/100;
        treasuryBalance += _penalty;
        jurors[_juror].staked -= _penalty;

        emit JurorSlashed(_juror, _penalty);

        _removeJuror(_juror);
    }

    function _removeJuror(address _juror)
        internal
    {
        require(jurors[_juror].staked > 0, "Moderation: Address is not a Juror");
        require(jurors[_juror].status == JUROR_STATUS_IDLE, "Moderation: Juror must be idle");

        uint256 _staked = jurors[_juror].staked;
        jurors[_juror] = Juror({ initialStaked: 0, staked: 0, status: JUROR_STATUS_IDLE });
        jurorsAddress.remove(_juror);
        IERC20Upgradeable(stakingToken).safeTransfer(_juror, _staked);

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

    function _distributeRewards(string calldata _contentId, bool _isContentOK)
        internal
    {
        require(cases[_contentId].status == CASE_STATUS_RULED, "Moderation: Case status must be CLOSED");

        cases[_contentId].status = CASE_STATUS_REWARDED;

        Rewards memory _rewards = Rewards({
            jury: new address[](cases[_contentId].jurySize),
            reporters: new address[](reported[_contentId].reportersSize),
            juryRewards: new uint256[](cases[_contentId].jurySize),
            reportersRewards: new uint256[](reported[_contentId].reportersSize),
            reportersPenalty: new uint256[](reported[_contentId].reportersSize),
            totalJuryRewards: 0,
            totalReportersRewards: 0,
            totalReportersPenalty: 0
        });

        // Reward Jury with the treasury because ruled
        address _juror = address(0);
        uint256 _jurorReward;
        for(uint256 _i=0; _i<cases[_contentId].jurySize; _i++){
            _juror = cases[_contentId].jury[_i];
            _rewards.jury[_i] = _juror;
            _jurorReward = (jurors[_juror].staked*jurorProfitPercentage)/100;
            jurors[_juror].staked += _jurorReward;
            _rewards.totalJuryRewards += _jurorReward;
        }
        delete _jurorReward;
        delete _juror;

        // Reward/Penalize the reporters
        uint256 _reporterReward = 0;
        address _reporter = address(0);
        for(uint256 _i=0; _i<reported[_contentId].reportersSize; _i++){
            _reporter = reported[_contentId].reporters[_i];
            _rewards.reporters[_i] = _reporter;
            if(_isContentOK){ // Apply penalty to the reporter because content is OK
                _reporterReward = (reported[_contentId].stakedByReporter[_reporter]*reporterPenaltyPercentage)/100;
                reported[_contentId].stakedByReporter[_reporter] -= _reporterReward;
                _rewards.totalReportersPenalty += _reporterReward;
                _rewards.reportersRewards[_i] = 0;
                _rewards.reportersPenalty[_i] = _reporterReward;
            }else{ // Reward the reporter because content will be removed
                _reporterReward = (reported[_contentId].stakedByReporter[_reporter]*reporterProfitPercentage)/100;
                reported[_contentId].stakedByReporter[_reporter] += _reporterReward;
                _rewards.totalReportersRewards += _reporterReward;
                _rewards.reportersRewards[_i] = _reporterReward;
                _rewards.reportersPenalty[_i] = 0;
            }
        }
        delete _reporterReward;

        treasuryBalance += _rewards.totalReportersPenalty;

        uint256 _totalRewards = _rewards.totalJuryRewards+_rewards.totalReportersRewards;
        if(_totalRewards >= treasuryBalance){
            revert("Not enough balance in the treasury");
        }
        treasuryBalance -= _totalRewards;
        delete _totalRewards;

        // Unstake reporter
        for(uint256 _i=0; _i<reported[_contentId].reportersSize; _i++){
            _reporter = reported[_contentId].reporters[_i];
            IERC20Upgradeable(stakingToken).safeTransfer(_reporter, reported[_contentId].stakedByReporter[_reporter]);
        }
        delete _reporter;

        emit CaseRewardsDistributed(_contentId, _rewards.jury, _rewards.reporters, _rewards.juryRewards, _rewards.reportersRewards, _rewards.reportersPenalty, _rewards.totalJuryRewards, _rewards.totalReportersRewards, _rewards.totalReportersPenalty);
    }

    function versionRecipient() external view virtual override returns (string memory) {
        return "2.2.3-matic";
    }

    function _msgSender() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(ContextUpgradeable, BaseRelayRecipient)
        returns (bytes memory) {
        return BaseRelayRecipient._msgData();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
    }

    /* ========== MODIFIERS ========== */

}