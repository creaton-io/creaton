// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;
pragma abicoder v2;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/OwnableBaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC721PresetMinterPauserAutoId.sol";

contract VoteCreators is Ownable, EERC721PresetMinterPauserAutoId {
    // -----------------------------------------
    // Events
    // -----------------------------------------

    //TODO: add events for The Graph

    // -----------------------------------------
    // Storage
    // -----------------------------------------

    // Help with calculating the winners
    struct TopBalance {
        uint256 balance;
        address addr;
    }

    // Which user voted for who and limit of vote
    struct Vote {
        address user;
        uint256 amount;
    }

    IERC20 public create = IERC20(0x3dd49f67E9d5Bc4C5E6634b3F70BfD9dc1b6BD74); //TODO: can use wETH before CREATE token is live

    TopBalance[9] public topBalances;
    address[9] public winners;

    uint256 private _totalSupply;

    //
    //Change based on new features
    //
    mapping(address => uint256) private userBalances;

    mapping(address => uint256) public votes; //Keeps the number of votes an address has.

    // -----------------------------------------
    // Constructor
    // -----------------------------------------

    //Constructor with NFT metadata that EERC721PresetMinterPauserAutoId needs for minting NFT's
    constructor(
        string name,
        string symbol,
        string baseURI
    ) {}

    // -----------------------------------------
    // Logic
    // -----------------------------------------

    function voteManually(address user) public onlyHost {
        votes[msg.sender] = votes[msg.sender].add(1); //give each user another vote
    }

    function nominate(address user) public {
        require(votes[msg.sender] > 0);
        votes[msg.sender] = votes[msg.sender].sub(1);
        votes[user] = votes[user].add(1);
    }

    //    function register() public {
    //        //need to have received an invitation once
    //        require(userInvites[msg.sender] && !userBalances[msg.sender]);
    //        userBalances[msg.sender] = 0;
    //    }

    function stake(address user, uint256 amount) public virtual {
        require(userBalances[user]); //check if user exists
        //For withdrawing the CREATE tokens later on (either directly at any time but vote wont count, or automatically send back in a loop at the distributeInvites function)
        _totalSupply = _totalSupply.add(amount);

        //Add vote points to user balance
        userBalances[user] = userBalances[user].add(amount);

        uni.safeTransferFrom(msg.sender, address(this), amount);

        //to keep track of the voter votes to delete them in case the user withdraws the vote before the round ends
        Vote memory currentVote;
        currentVote.user = user;
        currentVote.amount = amount;
        voterBalances[voter].push(currentVote);

        //Instead of checking at the end which user has the most votes (too costly), we run an algorithm every time someone voted (check total amount wih 10th top user and either replace or not)
        updateTop(user);
    }

    //better to only accept voters to withdraw all votes at once after the round is over, see note in Updatetop
    function withdraw(address user) public virtual {
        require(userBalances[user]); //check if user exists
        //substract specific user amounts from userBalances
        for (i; i < voterBalances[msg.sender].length; i++) {
            if (voterBalances[msg.sender][i].user == user) {
                //return tokens
                _totalSupply = _totalSupply.sub(voterBalances[msg.sender][i].amount);
                uni.safeTransfer(msg.sender, voterBalances[msg.sender][i].amount);

                //substract user from total votes of this specific voter
                userBalance[voterBalances[msg.sender][i].user].sub(voterBalances[msg.sender][i].amount);

                //delete specific vote
                delete voterBalances[msg.sender][i];
            }
        }
    }

    function withdrawAll() public virtual {
        //for loop to substract votes from all users the user voted on
        //substract specific user amounts from userBalances
        for (i; i < voterBalances[msg.sender].length; i++) {
            //return tokens
            _totalSupply = _totalSupply.sub(voterBalances[msg.sender][i].amount);
            voterBalances[msg.sender] = voterBalances[msg.sender].sub(voterBalances[msg.sender][i].amount);
            uni.safeTransfer(msg.sender, voterBalances[msg.sender][i].amount);

            //substract user from total votes of this specific voter
            userBalance[voterBalances[msg.sender][i].user].sub(voterBalances[msg.sender][i].amount);
        }

        //delete all votes from user
        //        delete voterBalances[msg.sender]{}
        //    }
    }

    //Finish round
    // Change to grabbing top ten users and giving them coins
    function distributeInvites() onlyHost {
        //TODO: Check the winner list in the creator.sol contract before letting the user sign up

        //loop through the top balance and add them to the winner list (see updateTop note on whether to keep topBalance updated on each vote or to calculate the top 10 in this function once)
        for (i; i < topBalances.length; i++) {
            winners[i] = topBalances[i].addr;
            mint(topBalances.addr); //uses the ERC721PresetMinterPauserAutoId so no ID necesarry, URI gets generated based off the constructor of this contract, the NFT (just for fun) gets send to the top balances
        }
        //reset votes
        delete topBalances;
        delete voterBalances;
        delete userBalances;

        //optional TODO: could automatically withdraw all tokens from users at the end of each round instead of having the user do it
    }

    // -----------------------------------------
    // Getters
    // -----------------------------------------

    // -----------------------------------------
    // Math functions
    // -----------------------------------------

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

    // babylonian method from Uniswap v2-core (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
