pragma solidity ^0.8.0;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/OwnableBaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC721PresetMinterPauserAutoId.sol";

contract test {
    // Represents a single voter
    struct Voter {
        bool voted; //limit: 1 vote per user
        address vote;
    }

    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    mapping(address => uint256) public voteCount;

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

    //     modifier updateTopVote(votedFor address){
    //   _;
    //   ~math here that maybe changes who the top votes are for

    // -----------------------------------------
    // Getters
    // -----------------------------------------

    // -----------------------------------------
    // Math functions
    // -----------------------------------------

    // Fix topBalances to ensure it works as intended

    function updateTop(address user) private {
        uint256 i = 0;
        //Get the index of the current max element

        //TODO: this only works when there's a new top user, doesnt work yet for when the user is already in the top
        //TODO: also keep track of it when a vote gets deleted as someone thats #10 might get displaced
        //NOTE: Above problem is that if a creator gets below top 10 there wont be anyone in the #9 and #10 as there's no track of them
        //so either just always iterate through all of the users, or iterate through all only in the case above.
        //or simpler, just not accept people withdrawing before the round is over
        //Best will probably be to only check at the distributeInvites function what the actual top 10 is, and on the front-end just let The Graph do the sorting.
        for (i; i < topBalances.length; i++) {
            if (topBalances[i].balance < userBalances[user]) {
                break;
            }
        }
        //Shift the array of position (getting rid of the last element)
        for (uint256 j = topBalances.length - 1; j > i; j--) {
            topBalances[j].balance = topBalances[j - 1].balance;
            topBalances[j].addr = topBalances[j - 1].addr;
        }
        //Update the new max element
        topBalances[i].balance = userBalances[user];
        topBalances[i].addr = user;
    }

    function topVote(uint256 newVote) private {}
}
