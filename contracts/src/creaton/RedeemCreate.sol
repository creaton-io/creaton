pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../dependency/sablier/interfaces/ISablier.sol";


// "dependency/sablier/ISablier.sol"
// "creaton/RedeemCreate.sol"

contract RedeemCreate{
    ISablier sablier = ISablier(0xAC18EAB6592F5fF6F9aCf5E0DCE0Df8E49124C06);
    address create;
    ERC20 protoTeam;
    ERC20 protoAdvisor;
    ERC20 ProtoPrivate;
    ERC20 protoSeed;
    constructor(address _create, address _protoTeam, address _protoAdvisor, address _ProtoPrivate, address _protoSeed){
        create = _create;
        protoTeam = ERC20(_protoTeam);
        protoAdvisor = ERC20(_protoAdvisor);
        ProtoPrivate = ERC20(_ProtoPrivate);
        protoSeed = ERC20(_protoSeed);

    }

    function startTeamStream(uint256 amountPutIn) public returns (uint256 streamID){
        //sender, amount, create Address, now, to two years from now
        protoTeam.transferFrom(msg.sender, address(this), amountPutIn);
        uint256 streamID = sablier.createStream(msg.sender, amountPutIn, create, block.timestamp, block.timestamp + 86400*365*2);
        return streamID;
    }

    function startAdvisorStream(uint256 amountPutIn) public returns (uint256 streamID){
        protoAdvisor.transferFrom(msg.sender, address(this), amountPutIn);
        uint256 streamID = sablier.createStream(msg.sender, amountPutIn, create, block.timestamp, block.timestamp + 86400*304);
        //86400 for seconds in a day, 304 for 10 months
        return streamID;
    }

    function startPrivateStream(uint256 amountPutIn) public returns (uint256 streamID){
        //sender, amount, create Address, now, to two years from now
        ProtoPrivate.transferFrom(msg.sender, address(this), amountPutIn);
        ERC20(create).transferFrom(msg.sender, address(this), amountPutIn/4);
        uint256 streamID = sablier.createStream(msg.sender, (amountPutIn*3)/4, create, block.timestamp + 86400*30, block.timestamp + 86400*152);
        //86400 for seconds in a day, 152 for 4 months, starting one month from now.
        return streamID;
    }
    function startSeedStream(uint256 amountPutIn) public returns (uint256 streamID){
        //sender, amount, create Address, now, to two years from now
        protoAdvisor.transferFrom(msg.sender, address(this), amountPutIn);
        ERC20(create).transferFrom(msg.sender, address(this), amountPutIn/4);
        uint256 streamID = sablier.createStream(msg.sender, (amountPutIn*3)/4, create, block.timestamp + 86400*30, block.timestamp + 86400*273);
        //86400 for seconds in a day, 273 for 8 months, starting one month from now.
        return streamID;
    }


}