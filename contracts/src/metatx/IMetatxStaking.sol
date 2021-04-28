pragma solidity ^0.8.0;


interface IMetatxStaking {
    // Views
    function lastTimeRewardApplicable() external view returns (uint256);

    function rewardPerToken() external view returns (uint256);

    function earned(address account) external view returns (uint256);

    function getRewardForDuration() external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    // Mutative

    function withdraw(uint256 amount) external;

    function getReward() external;

    function exit() external;

    function halvingRewards() external;
}