// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "hardhat/console.sol";

contract CreatorVoting is Context, ERC1155PresetMinterPauser, ERC1155Holder {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    event Created(string question, string description, string uri, string[] answers, address[] acceptedERC20);
    event Voted(uint256 answerId, address votingToken, uint256 votingAmount);

    string private _question = "";
    string private _description = "";
    string[] private _answers;
    EnumerableSet.AddressSet private _acceptedERC20;

    constructor (
        string memory question,
        string memory description,
        string memory uri,
        string[] memory answers,   
        address[] memory acceptedERC20
    ) ERC1155PresetMinterPauser(uri) {
        _question = question;
        _description = description;
        _answers = answers;
        
        uint256 addressesLength = acceptedERC20.length;
        for (uint256 i=0; i<addressesLength; i++) {
            _acceptedERC20.add(acceptedERC20[i]);
        }

        uint256 answersLength = answers.length;
        for (uint256 i=0; i<answersLength; i++) {
            _mint(address(this), i, 0, bytes(answers[i]));
        }

        emit Created(question, description, uri, answers, acceptedERC20);
    }

    function getDetails() 
        public view 
        returns (string memory, string memory, string[] memory, address[] memory)
    {
        return (_question, _description, _answers, _acceptedERC20.values());
    }

    function vote(uint256 answerId, address votingToken, uint256 votingAmount)
        public
    {
        require(answerId < _answers.length, "CreatorVoting: answerId must exist");
        require(address(votingToken) != address(0), "CreatorVoting: votingToken Address can't be 0x");
        require(votingAmount > 0, "CreatorVoting: votingAmount must be > 0");
        require(_acceptedERC20.contains(votingToken), "CreatorVoting: votingToken Address not allowed");

        IERC20(votingToken).transferFrom(_msgSender(), address(this), votingAmount);

        _mint(address(this), answerId, votingAmount, bytes(_answers[answerId]));

        emit Voted(answerId, votingToken, votingAmount);
    }

    function results() 
        public view 
        returns (uint256[] memory)
    {
        uint256 answersLength = _answers.length;
        uint256[] memory votingResults = new uint256[](answersLength);

        for (uint256 i=0; i<answersLength; i++) {
            votingResults[i] = balanceOf(address(this), i);
        }

        return votingResults;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155PresetMinterPauser, ERC1155Receiver)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}