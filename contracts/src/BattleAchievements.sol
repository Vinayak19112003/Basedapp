// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BattleAchievements
 * @notice NFT contract for battle game achievements and milestones
 * @dev Soulbound tokens that cannot be transferred once minted
 */
contract BattleAchievements is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    // Achievement definitions
    struct Achievement {
        uint256 id;
        string name;
        string description;
        string imageURI;
        uint256 rarity; // 1=Common, 2=Rare, 3=Epic, 4=Legendary
    }

    // Mapping from achievement ID to achievement data
    mapping(uint256 => Achievement) public achievements;

    // Mapping from player to achievement IDs they've earned
    mapping(address => mapping(uint256 => bool)) public playerAchievements;
    mapping(address => uint256[]) public playerAchievementList;

    // Mapping from token ID to achievement ID
    mapping(uint256 => uint256) public tokenAchievement;
    mapping(uint256 => address) public tokenOwner;

    // Authorized minters (game contract)
    mapping(address => bool) public authorizedMinters;

    // Soulbound: prevent transfers
    bool public soulbound = true;

    event AchievementDefined(uint256 indexed achievementId, string name);
    event AchievementMinted(address indexed player, uint256 indexed achievementId, uint256 tokenId);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);

    constructor() ERC721("Battle Achievements", "BATTLE") {
        _defineAchievements();
    }

    /**
     * @dev Define all available achievements
     */
    function _defineAchievements() internal {
        _defineAchievement(1, "First Blood", "Win your first battle", "ipfs://QmFirstBlood", 1);
        _defineAchievement(2, "Warrior", "Win 10 battles", "ipfs://QmWarrior", 2);
        _defineAchievement(3, "Champion", "Win 100 battles", "ipfs://QmChampion", 3);
        _defineAchievement(4, "Legend", "Win 1000 battles", "ipfs://QmLegend", 4);
        _defineAchievement(5, "Hot Streak", "Win 5 battles in a row", "ipfs://QmHotStreak", 2);
        _defineAchievement(6, "Unstoppable", "Win 10 battles in a row", "ipfs://QmUnstoppable", 3);
        _defineAchievement(7, "Master", "Reach 1500 ELO rating", "ipfs://QmMaster", 3);
        _defineAchievement(8, "Grandmaster", "Reach 2000 ELO rating", "ipfs://QmGrandmaster", 4);
        _defineAchievement(9, "High Roller", "Win a battle with 1 ETH+ wager", "ipfs://QmHighRoller", 3);
        _defineAchievement(10, "Tournament Victor", "Win a tournament", "ipfs://QmTournamentVictor", 3);
        _defineAchievement(11, "Perfect Season", "Finish a tournament undefeated", "ipfs://QmPerfectSeason", 4);
        _defineAchievement(12, "Community Leader", "Refer 10 players", "ipfs://QmCommunityLeader", 2);
    }

    function _defineAchievement(
        uint256 id,
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 rarity
    ) internal {
        achievements[id] = Achievement({
            id: id,
            name: name,
            description: description,
            imageURI: imageURI,
            rarity: rarity
        });

        emit AchievementDefined(id, name);
    }

    /**
     * @notice Mint achievement to player
     * @dev Can only be called by authorized minters (game contract)
     */
    function mintAchievement(address to, uint256 achievementId) external {
        require(authorizedMinters[msg.sender], "Not authorized");
        require(achievements[achievementId].id != 0, "Achievement doesn't exist");
        require(!playerAchievements[to][achievementId], "Already earned");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);

        tokenAchievement[newTokenId] = achievementId;
        tokenOwner[newTokenId] = to;
        playerAchievements[to][achievementId] = true;
        playerAchievementList[to].push(achievementId);

        emit AchievementMinted(to, achievementId, newTokenId);
    }

    /**
     * @notice Get all achievements earned by a player
     */
    function getPlayerAchievements(address player) external view returns (uint256[] memory) {
        return playerAchievementList[player];
    }

    /**
     * @notice Check if player has specific achievement
     */
    function hasAchievement(address player, uint256 achievementId) external view returns (bool) {
        return playerAchievements[player][achievementId];
    }

    /**
     * @notice Get achievement data
     */
    function getAchievement(uint256 achievementId) external view returns (Achievement memory) {
        return achievements[achievementId];
    }

    /**
     * @notice Generate on-chain metadata for token
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token doesn't exist");

        uint256 achievementId = tokenAchievement[tokenId];
        Achievement memory achievement = achievements[achievementId];

        string memory rarityStr = _getRarityString(achievement.rarity);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        achievement.name,
                        '", "description": "',
                        achievement.description,
                        '", "image": "',
                        achievement.imageURI,
                        '", "attributes": [{"trait_type": "Rarity", "value": "',
                        rarityStr,
                        '"}, {"trait_type": "Achievement ID", "value": ',
                        achievementId.toString(),
                        '}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _getRarityString(uint256 rarity) internal pure returns (string memory) {
        if (rarity == 1) return "Common";
        if (rarity == 2) return "Rare";
        if (rarity == 3) return "Epic";
        if (rarity == 4) return "Legendary";
        return "Unknown";
    }

    /**
     * @dev Override transfer functions to make tokens soulbound
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Allow minting (from == address(0)) but prevent transfers
        if (soulbound && from != address(0)) {
            revert("Soulbound: token cannot be transferred");
        }
    }

    // ============ Admin Functions ============

    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    function setSoulbound(bool _soulbound) external onlyOwner {
        soulbound = _soulbound;
    }

    function addAchievement(
        uint256 id,
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 rarity
    ) external onlyOwner {
        require(achievements[id].id == 0, "Achievement already exists");
        _defineAchievement(id, name, description, imageURI, rarity);
    }

    function updateAchievementMetadata(
        uint256 id,
        string memory imageURI
    ) external onlyOwner {
        require(achievements[id].id != 0, "Achievement doesn't exist");
        achievements[id].imageURI = imageURI;
    }
}
