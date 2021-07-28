pragma solidity ^0.8.0;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/OwnableBaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC721PresetMinterPauserAutoId.sol";

import {ISuperfluid, ISuperToken, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
//    ToDo Figure out if i need these
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {Int96SafeMath} from "../utils/Int96SafeMath.sol";

//

//Top 30 new ppl get stream open to them
//Manually call fn, once a week

contract test is SuperAppBase, Initializable, BaseRelayRecipient {
    using Int96SafeMath for int96;

    // Represents a single voter
    struct Voter {
        address vote;
    }

    struct Nominee {
        uint256 voteCount;
    }

    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    mapping(address => uint256) public voteCount;

    //TODO create mapping for nominee and fix every method accoridingly
    mapping(address => nominee) public nominee;

    Nominee[30] public nominee;

    //This makes sure a user has tokens avaiable in their wallet to vote with
    modifier AbilityToVote(address _voter) {
        balance = token.balanceOf(_voter);
        require(balance > 0);
        _;
    }

    // Give your vote to a user
    function vote(address proposal) public AbilityToVote(msg.sender) returns (bool) {
        Voter storage sender = voters[msg.sender];
        // require(!sender.voted, "Already voted.");
        // sender.voted = true;
        // sender.vote = proposal;
        // voteCount[proposal] += 1;
        //TODO Can calculate top vote within here, create a new fn
        votesReceived = token.balanceOf(msg.sender);
        voteCount[proposal] += votesReceived;
        sender.vote = proposal;
        // topVote(voteCount);
        return true;
    }

    function unVote(address proposal) public {
        Voter storage sender = voters[msg.sender];
        sender.vote = proposal;
        voteCount[proposal] -= 1;
        //TODO Can calculate top vote within here, create a new fn
        topVote(voteCount);
        recoverTokens(_token);
    }

    //returns a new nominee list
    function topVote(uint256 newVote) public returns (uint256 newOrder) {
        Nominee[30] newOrder;
        count = 0;
        // nominee.length - 1
        for (uint256 i = 0; i < 29; i++) {
            if (nominee[i].voteCount > nominee[i + 1].voteCount) {
                newOrder[count] = nominee[i];
                count += 1;
            }
        }
        return newOrder[30];
    }

    //Sets when a voting season will come to an end
    function VotingSeasonEnds(address proposal) internal {
        require();
        //
    }

    ////

    /////
    function recoverTokens(address _token) external onlyCreator {
        IERC20(_token).approve(address(this), 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        IERC20(_token).transfer(_msgSender(), IERC20(_token).balanceOf(address(this)));
    }

    // -----------------------------------------
    // Superfluid Logic
    // -----------------------------------------

    function _openFlows(
        bytes calldata ctx,
        int256 contract2creator,
        int256 contract2treasury
    ) private returns (bytes memory newCtx) {
        // open flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.createFlow.selector, _acceptedToken, creator, contract2creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // open flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                adminContract.treasury(),
                contract2treasury,
                new bytes(0)
            ),
            new bytes(0),
            newCtx
        );
    }

    function _updateFlows(
        bytes calldata ctx,
        int96 contract2creator,
        int96 contract2treasury
    ) private returns (bytes memory newCtx) {
        // update flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.updateFlow.selector, _acceptedToken, creator, contract2creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // update flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                adminContract.treasury(),
                contract2treasury,
                new bytes(0)
            ), // call data
            new bytes(0), // user data
            newCtx // ctx
        );
    }

    function _deleteFlows(bytes calldata ctx) private returns (bytes memory newCtx) {
        // delete flow to creator
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(_cfa.deleteFlow.selector, _acceptedToken, address(this), creator, new bytes(0)),
            new bytes(0),
            ctx
        );

        // delete flow to treasury
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                address(this),
                adminContract.treasury(),
                new bytes(0)
            ), // call data
            new bytes(0), // user data
            newCtx // ctx
        );
    }
}
