pragma solidity ^0.8.0;

interface ICreatonAdmin {

    function treasury() external returns (address);

    function treasuryFee() external returns (int96);

    function nftFactory() external returns (address);

    function registeredUsers(address) external returns (bool);

    function getTrustedForwarder() external view returns (address);

}
