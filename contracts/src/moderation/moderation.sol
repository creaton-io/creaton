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

    address stakingToken;
    address owner;

    mapping (address => uint256) public jurors; // address -> staked

    event Initialized(address stakingToken);
    event JurorAdded(address juror, uint256 staked);
    event JurorRemoved(address juror, uint256 staked);

    function initialize(address _stakingToken) public initializer {
        stakingToken = _stakingToken;
        owner = _msgSender();

        emit Initialized(stakingToken);
    }

    function addJuror(uint256 _stake) 
        public 
    {
        require(jurors[_msgSender()] == 0, "Moderation: MsgSender is already a Juror");

        IERC20(stakingToken).safeTransferFrom(_msgSender(), address(this), _stake);
        jurors[_msgSender()] = _stake;

        emit JurorAdded(_msgSender(), _stake);
    }

    function removeJuror() 
        public 
    {
        require(jurors[_msgSender()] != 0, "Moderation: MsgSender is not a Juror");

        uint256 _staked = jurors[_msgSender()];
        jurors[_msgSender()] = 0;
        IERC20(stakingToken).safeTransfer(_msgSender(), _staked);

        emit JurorRemoved(_msgSender(), _staked);
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