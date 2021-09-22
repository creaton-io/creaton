// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./VotingProcess.sol";

contract VotingFactory is Context, UUPSUpgradeable, Initializable {
    address owner;

    event Initialized(address owner);
    event VotingProcessDeployed(address creator, address votingProcessAddress, string question, string description, string uri, string[] answers, address[] acceptedERC20);

    function initialize() public payable initializer {
        owner = _msgSender();
        emit Initialized(owner);
    }

    function createVotingProcess( 
        string memory question,
        string memory description,
        string memory uri,
        string[] memory answers,   
        address[] memory acceptedERC20
    ) external returns (address) {
        VotingProcess votingProcess = new VotingProcess(question, description, uri, answers, acceptedERC20);

        address votingProcessAddress = address(votingProcess);

        emit VotingProcessDeployed(_msgSender(), votingProcessAddress, question, description, uri, answers, acceptedERC20);
        return address(votingProcess);
    }


    /* ========== RESTRICTED FUNCTIONS ========== */

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
    }

     /* ========== MODIFIERS ========== */

    modifier onlyOwner() {
        require(msg.sender == owner, "VotingFactory: Caller is not owner");
        _;
    }
}