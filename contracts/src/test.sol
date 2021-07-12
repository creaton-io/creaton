pragma solidity ^0.8.0;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/OwnableBaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC721PresetMinterPauserAutoId.sol";

//Top 30 new ppl get stream open to them
//Manually call fn, once a week

contract test {
    // Represents a single voter
    struct Voter {
        bool voted; //limit: 1 vote per user
        address vote;
    }

    //Add mappinge etc
    struct Nominee {
        uint256 voteCount;
    }

    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    mapping(address => uint256) public voteCount;

    //TODO create mapping for nominee and fix every method accoridingly
    mapping(address => nominee) public nominee;

    // A dynamically-sized array of `Nominee` structs.
    Nominee[] public nominee;

    /// Give your vote to a user
    function vote(address proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        voteCount[proposal] += 1;
        //TODO Can calculate top vote within here, create a new fn dummy
        topVote(voteCount);
    }

    function unVote(address proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already Unvoted");
        sender.voted = false;
        sender.vote = proposal;
        voteCount[proposal] -= 1;
        //TODO Can calculate top vote within here, create a new fn dummy
        topVote(voteCount);
    }

    function topVote(uint256 newVote) public {
        for (uint256 i = 1; i < nominee.length(); i++) {
            if (nominee[i].voteCount > nominee[i - 1] + newVote) {
                //stuff
                //return stuff
                //check top 10 only
                //Give them money to vote
                //Streaming it
                
            }
        }
    }
}
