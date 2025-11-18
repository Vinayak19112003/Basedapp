// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBattleAchievements {
    function mintAchievement(address to, uint256 achievementId) external;
}
