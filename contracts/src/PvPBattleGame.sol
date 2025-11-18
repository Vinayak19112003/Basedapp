// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IBattleAchievements.sol";

/**
 * @title PvPBattleGame
 * @notice Rock-Paper-Scissors-Lizard-Spock PvP battle game with commit-reveal pattern
 * @dev Implements wager-based battles with ELO ratings, tournaments, and achievement system
 */
contract PvPBattleGame is ReentrancyGuard, Pausable, Ownable {
    // ============ Game Constants ============

    uint8 public constant ROCK = 1;
    uint8 public constant PAPER = 2;
    uint8 public constant SCISSORS = 3;
    uint8 public constant LIZARD = 4;
    uint8 public constant SPOCK = 5;

    uint256 public constant REVEAL_TIMEOUT = 5 minutes;
    uint256 public constant WINNER_PERCENTAGE = 95;
    uint256 public constant TREASURY_FEE = 5;
    uint256 public constant MAX_WAGER = 10 ether;
    uint256 public constant MIN_WAGER = 0.001 ether;
    uint256 public constant INITIAL_ELO = 1000;
    uint256 public constant K_FACTOR = 32; // ELO K-factor

    // ============ Structs ============

    struct Battle {
        address player1;
        address player2;
        uint256 wager;
        address tokenAddress; // address(0) for ETH
        bytes32 player1CommitHash;
        bytes32 player2CommitHash;
        uint8 player1Move;
        uint8 player2Move;
        bool player1Revealed;
        bool player2Revealed;
        uint256 createdAt;
        uint256 revealDeadline;
        BattleStatus status;
        address winner;
    }

    struct PlayerStats {
        uint256 wins;
        uint256 losses;
        uint256 draws;
        uint256 totalBattles;
        uint256 eloRating;
        uint256 totalWagered;
        uint256 totalWon;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 lastBattleTime;
    }

    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        mapping(address => bool) isParticipant;
        mapping(address => uint256) scores;
        TournamentStatus status;
        TournamentType tournamentType;
    }

    enum BattleStatus {
        Created,
        Active,
        Revealing,
        Completed,
        Cancelled,
        Expired
    }

    enum TournamentStatus {
        Pending,
        Active,
        Completed
    }

    enum TournamentType {
        Daily,
        Weekly,
        Special
    }

    // ============ State Variables ============

    uint256 public battleCounter;
    uint256 public tournamentCounter;
    uint256 public treasuryBalance;

    mapping(uint256 => Battle) public battles;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerBattles;
    mapping(uint256 => Tournament) public tournaments;

    // Leaderboard: sorted array of addresses by ELO
    address[] public leaderboard;
    mapping(address => uint256) public leaderboardIndex;

    // Supported tokens for wagers
    mapping(address => bool) public supportedTokens;

    // Anti-bot: Rate limiting
    mapping(address => uint256) public lastActionTime;
    uint256 public constant ACTION_COOLDOWN = 1 seconds;

    // VIP tiers based on volume
    mapping(address => uint8) public vipTier;
    uint256 public constant VIP_TIER1_THRESHOLD = 1 ether;
    uint256 public constant VIP_TIER2_THRESHOLD = 10 ether;
    uint256 public constant VIP_TIER3_THRESHOLD = 100 ether;

    // Referral system
    mapping(address => address) public referrals;
    mapping(address => uint256) public referralEarnings;
    uint256 public constant REFERRAL_COMMISSION = 2; // 2% of fees

    // Achievement NFT contract
    IBattleAchievements public achievementContract;

    // ============ Events ============

    event BattleCreated(uint256 indexed battleId, address indexed player1, uint256 wager, address token);
    event BattleJoined(uint256 indexed battleId, address indexed player2);
    event MoveCommitted(uint256 indexed battleId, address indexed player);
    event MoveRevealed(uint256 indexed battleId, address indexed player, uint8 move);
    event BattleCompleted(uint256 indexed battleId, address indexed winner, uint256 payout);
    event BattleDraw(uint256 indexed battleId);
    event BattleCancelled(uint256 indexed battleId);
    event EloUpdated(address indexed player, uint256 oldElo, uint256 newElo);
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee);
    event TournamentJoined(uint256 indexed tournamentId, address indexed player);
    event TournamentCompleted(uint256 indexed tournamentId, address[] winners);
    event TreasuryWithdrawal(address indexed to, uint256 amount);
    event ReferralSet(address indexed player, address indexed referrer);
    event ReferralEarned(address indexed referrer, uint256 amount);
    event VIPTierUpdated(address indexed player, uint8 tier);

    // ============ Modifiers ============

    modifier rateLimited() {
        require(
            block.timestamp >= lastActionTime[msg.sender] + ACTION_COOLDOWN,
            "Action too frequent"
        );
        lastActionTime[msg.sender] = block.timestamp;
        _;
    }

    modifier validMove(uint8 move) {
        require(move >= ROCK && move <= SPOCK, "Invalid move");
        _;
    }

    // ============ Constructor ============

    constructor(address _achievementContract) {
        achievementContract = IBattleAchievements(_achievementContract);
    }

    // ============ Battle Functions ============

    /**
     * @notice Create a new battle room with a wager
     * @param wager Amount to wager
     * @param tokenAddress Token address (address(0) for ETH)
     * @param commitHash Hashed move: keccak256(abi.encodePacked(move, salt))
     * @param referrer Optional referrer address
     */
    function createBattle(
        uint256 wager,
        address tokenAddress,
        bytes32 commitHash,
        address referrer
    ) external payable whenNotPaused rateLimited nonReentrant returns (uint256) {
        require(wager >= MIN_WAGER && wager <= MAX_WAGER, "Invalid wager amount");
        require(commitHash != bytes32(0), "Invalid commit hash");

        // Handle payment
        if (tokenAddress == address(0)) {
            require(msg.value == wager, "Incorrect ETH amount");
        } else {
            require(supportedTokens[tokenAddress], "Token not supported");
            require(msg.value == 0, "No ETH needed for token wager");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), wager);
        }

        // Set referrer if first time and valid
        if (referrals[msg.sender] == address(0) && referrer != address(0) && referrer != msg.sender) {
            referrals[msg.sender] = referrer;
            emit ReferralSet(msg.sender, referrer);
        }

        // Initialize player stats if new
        if (playerStats[msg.sender].eloRating == 0) {
            playerStats[msg.sender].eloRating = INITIAL_ELO;
            leaderboard.push(msg.sender);
            leaderboardIndex[msg.sender] = leaderboard.length - 1;
        }

        battleCounter++;
        Battle storage battle = battles[battleCounter];
        battle.player1 = msg.sender;
        battle.wager = wager;
        battle.tokenAddress = tokenAddress;
        battle.player1CommitHash = commitHash;
        battle.createdAt = block.timestamp;
        battle.status = BattleStatus.Created;

        playerBattles[msg.sender].push(battleCounter);

        emit BattleCreated(battleCounter, msg.sender, wager, tokenAddress);

        return battleCounter;
    }

    /**
     * @notice Join an existing battle
     * @param battleId Battle ID to join
     * @param commitHash Hashed move
     */
    function joinBattle(uint256 battleId, bytes32 commitHash)
        external
        payable
        whenNotPaused
        rateLimited
        nonReentrant
    {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.Created, "Battle not available");
        require(battle.player1 != msg.sender, "Cannot battle yourself");
        require(commitHash != bytes32(0), "Invalid commit hash");

        // Handle payment
        if (battle.tokenAddress == address(0)) {
            require(msg.value == battle.wager, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "No ETH needed for token wager");
            IERC20(battle.tokenAddress).transferFrom(msg.sender, address(this), battle.wager);
        }

        // Initialize player stats if new
        if (playerStats[msg.sender].eloRating == 0) {
            playerStats[msg.sender].eloRating = INITIAL_ELO;
            leaderboard.push(msg.sender);
            leaderboardIndex[msg.sender] = leaderboard.length - 1;
        }

        battle.player2 = msg.sender;
        battle.player2CommitHash = commitHash;
        battle.status = BattleStatus.Active;
        battle.revealDeadline = block.timestamp + REVEAL_TIMEOUT;

        playerBattles[msg.sender].push(battleId);

        emit BattleJoined(battleId, msg.sender);
    }

    /**
     * @notice Reveal your move in a battle
     * @param battleId Battle ID
     * @param move Your move (1-5)
     * @param salt Random salt used in commit
     */
    function revealMove(uint256 battleId, uint8 move, bytes32 salt)
        external
        whenNotPaused
        validMove(move)
        nonReentrant
    {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.Active, "Battle not active");
        require(block.timestamp <= battle.revealDeadline, "Reveal period expired");

        bytes32 commitHash = keccak256(abi.encodePacked(move, salt, msg.sender));

        if (msg.sender == battle.player1) {
            require(!battle.player1Revealed, "Already revealed");
            require(commitHash == battle.player1CommitHash, "Invalid reveal");
            battle.player1Move = move;
            battle.player1Revealed = true;
        } else if (msg.sender == battle.player2) {
            require(!battle.player2Revealed, "Already revealed");
            require(commitHash == battle.player2CommitHash, "Invalid reveal");
            battle.player2Move = move;
            battle.player2Revealed = true;
        } else {
            revert("Not a player in this battle");
        }

        emit MoveRevealed(battleId, msg.sender, move);

        // If both revealed, determine winner
        if (battle.player1Revealed && battle.player2Revealed) {
            _completeBattle(battleId);
        }
    }

    /**
     * @notice Claim win if opponent fails to reveal in time
     * @param battleId Battle ID
     */
    function claimTimeout(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.Active, "Battle not active");
        require(block.timestamp > battle.revealDeadline, "Reveal period not expired");

        address winner;

        if (battle.player1Revealed && !battle.player2Revealed) {
            winner = battle.player1;
        } else if (!battle.player1Revealed && battle.player2Revealed) {
            winner = battle.player2;
        } else {
            // Both failed to reveal - return wagers
            battle.status = BattleStatus.Expired;
            _refundBattle(battleId);
            return;
        }

        battle.winner = winner;
        battle.status = BattleStatus.Completed;

        _updateStatsForTimeout(battleId, winner);
        _payout(battleId, winner);

        emit BattleCompleted(battleId, winner, (battle.wager * 2 * WINNER_PERCENTAGE) / 100);
    }

    /**
     * @notice Cancel a battle if no one has joined
     * @param battleId Battle ID
     */
    function cancelBattle(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.player1 == msg.sender, "Not battle creator");
        require(battle.status == BattleStatus.Created, "Cannot cancel");
        require(block.timestamp > battle.createdAt + 1 hours, "Too soon to cancel");

        battle.status = BattleStatus.Cancelled;

        // Refund player1
        if (battle.tokenAddress == address(0)) {
            (bool success, ) = battle.player1.call{value: battle.wager}("");
            require(success, "Refund failed");
        } else {
            IERC20(battle.tokenAddress).transfer(battle.player1, battle.wager);
        }

        emit BattleCancelled(battleId);
    }

    // ============ Internal Battle Logic ============

    /**
     * @dev Complete a battle and determine winner
     */
    function _completeBattle(uint256 battleId) internal {
        Battle storage battle = battles[battleId];

        uint8 move1 = battle.player1Move;
        uint8 move2 = battle.player2Move;

        // Determine winner using game rules
        int8 result = _determineWinner(move1, move2);

        if (result == 0) {
            // Draw - refund both
            battle.status = BattleStatus.Completed;
            _refundBattle(battleId);
            _updateStatsForDraw(battleId);
            emit BattleDraw(battleId);
        } else {
            address winner = result == 1 ? battle.player1 : battle.player2;
            battle.winner = winner;
            battle.status = BattleStatus.Completed;

            _updateStats(battleId, winner);
            _payout(battleId, winner);
            _checkAchievements(winner);

            emit BattleCompleted(battleId, winner, (battle.wager * 2 * WINNER_PERCENTAGE) / 100);
        }
    }

    /**
     * @dev Determine winner: 1 = player1 wins, -1 = player2 wins, 0 = draw
     * Rock-Paper-Scissors-Lizard-Spock rules:
     * Rock crushes Scissors, Rock crushes Lizard
     * Paper covers Rock, Paper disproves Spock
     * Scissors cuts Paper, Scissors decapitates Lizard
     * Lizard eats Paper, Lizard poisons Spock
     * Spock smashes Scissors, Spock vaporizes Rock
     */
    function _determineWinner(uint8 move1, uint8 move2) internal pure returns (int8) {
        if (move1 == move2) return 0; // Draw

        if (move1 == ROCK && (move2 == SCISSORS || move2 == LIZARD)) return 1;
        if (move1 == PAPER && (move2 == ROCK || move2 == SPOCK)) return 1;
        if (move1 == SCISSORS && (move2 == PAPER || move2 == LIZARD)) return 1;
        if (move1 == LIZARD && (move2 == PAPER || move2 == SPOCK)) return 1;
        if (move1 == SPOCK && (move2 == SCISSORS || move2 == ROCK)) return 1;

        return -1; // Player 2 wins
    }

    /**
     * @dev Update player statistics after a battle
     */
    function _updateStats(uint256 battleId, address winner) internal {
        Battle storage battle = battles[battleId];
        address loser = winner == battle.player1 ? battle.player2 : battle.player1;

        PlayerStats storage winnerStats = playerStats[winner];
        PlayerStats storage loserStats = playerStats[loser];

        // Update basic stats
        winnerStats.wins++;
        winnerStats.totalBattles++;
        winnerStats.totalWagered += battle.wager;
        winnerStats.totalWon += (battle.wager * 2 * WINNER_PERCENTAGE) / 100;
        winnerStats.currentStreak++;
        winnerStats.lastBattleTime = block.timestamp;

        if (winnerStats.currentStreak > winnerStats.bestStreak) {
            winnerStats.bestStreak = winnerStats.currentStreak;
        }

        loserStats.losses++;
        loserStats.totalBattles++;
        loserStats.totalWagered += battle.wager;
        loserStats.currentStreak = 0;
        loserStats.lastBattleTime = block.timestamp;

        // Update ELO ratings
        _updateElo(winner, loser);

        // Update VIP tiers
        _updateVIPTier(winner);
        _updateVIPTier(loser);
    }

    /**
     * @dev Update stats for draw
     */
    function _updateStatsForDraw(uint256 battleId) internal {
        Battle storage battle = battles[battleId];

        playerStats[battle.player1].draws++;
        playerStats[battle.player1].totalBattles++;
        playerStats[battle.player1].totalWagered += battle.wager;
        playerStats[battle.player1].currentStreak = 0;
        playerStats[battle.player1].lastBattleTime = block.timestamp;

        playerStats[battle.player2].draws++;
        playerStats[battle.player2].totalBattles++;
        playerStats[battle.player2].totalWagered += battle.wager;
        playerStats[battle.player2].currentStreak = 0;
        playerStats[battle.player2].lastBattleTime = block.timestamp;

        _updateVIPTier(battle.player1);
        _updateVIPTier(battle.player2);
    }

    /**
     * @dev Update stats for timeout win
     */
    function _updateStatsForTimeout(uint256 battleId, address winner) internal {
        Battle storage battle = battles[battleId];
        address loser = winner == battle.player1 ? battle.player2 : battle.player1;

        playerStats[winner].wins++;
        playerStats[winner].totalBattles++;
        playerStats[winner].totalWon += (battle.wager * 2 * WINNER_PERCENTAGE) / 100;
        playerStats[winner].currentStreak++;
        playerStats[winner].lastBattleTime = block.timestamp;

        playerStats[loser].losses++;
        playerStats[loser].totalBattles++;
        playerStats[loser].currentStreak = 0;
        playerStats[loser].lastBattleTime = block.timestamp;

        // Penalize loser more heavily in ELO for timeout
        uint256 oldWinnerElo = playerStats[winner].eloRating;
        uint256 oldLoserElo = playerStats[loser].eloRating;

        playerStats[winner].eloRating += K_FACTOR;
        playerStats[loser].eloRating -= K_FACTOR * 2; // Double penalty

        emit EloUpdated(winner, oldWinnerElo, playerStats[winner].eloRating);
        emit EloUpdated(loser, oldLoserElo, playerStats[loser].eloRating);

        _updateLeaderboard(winner);
        _updateLeaderboard(loser);
    }

    /**
     * @dev Update ELO ratings using standard ELO formula
     */
    function _updateElo(address winner, address loser) internal {
        uint256 winnerElo = playerStats[winner].eloRating;
        uint256 loserElo = playerStats[loser].eloRating;

        // Expected score calculation
        uint256 expectedWinner = _expectedScore(winnerElo, loserElo);
        uint256 expectedLoser = _expectedScore(loserElo, winnerElo);

        // New ratings
        uint256 newWinnerElo = winnerElo + (K_FACTOR * (100 - expectedWinner)) / 100;
        uint256 newLoserElo = loserElo > (K_FACTOR * expectedLoser) / 100
            ? loserElo - (K_FACTOR * expectedLoser) / 100
            : INITIAL_ELO / 2; // Minimum ELO floor

        playerStats[winner].eloRating = newWinnerElo;
        playerStats[loser].eloRating = newLoserElo;

        emit EloUpdated(winner, winnerElo, newWinnerElo);
        emit EloUpdated(loser, loserElo, newLoserElo);

        // Update leaderboard positions
        _updateLeaderboard(winner);
        _updateLeaderboard(loser);
    }

    /**
     * @dev Calculate expected score (0-100)
     */
    function _expectedScore(uint256 ratingA, uint256 ratingB) internal pure returns (uint256) {
        int256 diff = int256(ratingA) - int256(ratingB);
        // Simplified expected score: 50 + diff/20 (bounded 0-100)
        int256 expected = 50 + diff / 20;
        if (expected > 100) return 100;
        if (expected < 0) return 0;
        return uint256(expected);
    }

    /**
     * @dev Update leaderboard position for a player
     */
    function _updateLeaderboard(address player) internal {
        uint256 playerElo = playerStats[player].eloRating;
        uint256 currentIndex = leaderboardIndex[player];

        // Bubble up if ELO increased
        while (currentIndex > 0 && playerStats[leaderboard[currentIndex - 1]].eloRating < playerElo) {
            address temp = leaderboard[currentIndex - 1];
            leaderboard[currentIndex - 1] = player;
            leaderboard[currentIndex] = temp;

            leaderboardIndex[player] = currentIndex - 1;
            leaderboardIndex[temp] = currentIndex;

            currentIndex--;
        }

        // Bubble down if ELO decreased
        while (currentIndex < leaderboard.length - 1 && playerStats[leaderboard[currentIndex + 1]].eloRating > playerElo) {
            address temp = leaderboard[currentIndex + 1];
            leaderboard[currentIndex + 1] = player;
            leaderboard[currentIndex] = temp;

            leaderboardIndex[player] = currentIndex + 1;
            leaderboardIndex[temp] = currentIndex;

            currentIndex++;
        }
    }

    /**
     * @dev Process payout to winner
     */
    function _payout(uint256 battleId, address winner) internal {
        Battle storage battle = battles[battleId];

        uint256 totalPot = battle.wager * 2;
        uint256 winnerPayout = (totalPot * WINNER_PERCENTAGE) / 100;
        uint256 treasuryAmount = totalPot - winnerPayout;

        treasuryBalance += treasuryAmount;

        // Pay referral commission if exists
        address referrer = referrals[winner];
        if (referrer != address(0)) {
            uint256 referralAmount = (treasuryAmount * REFERRAL_COMMISSION) / 100;
            referralEarnings[referrer] += referralAmount;
            treasuryBalance -= referralAmount;
            emit ReferralEarned(referrer, referralAmount);
        }

        // Transfer winnings
        if (battle.tokenAddress == address(0)) {
            (bool success, ) = winner.call{value: winnerPayout}("");
            require(success, "Payout failed");
        } else {
            IERC20(battle.tokenAddress).transfer(winner, winnerPayout);
        }
    }

    /**
     * @dev Refund both players in case of draw or expiry
     */
    function _refundBattle(uint256 battleId) internal {
        Battle storage battle = battles[battleId];

        if (battle.tokenAddress == address(0)) {
            (bool success1, ) = battle.player1.call{value: battle.wager}("");
            (bool success2, ) = battle.player2.call{value: battle.wager}("");
            require(success1 && success2, "Refund failed");
        } else {
            IERC20(battle.tokenAddress).transfer(battle.player1, battle.wager);
            IERC20(battle.tokenAddress).transfer(battle.player2, battle.wager);
        }
    }

    /**
     * @dev Update VIP tier based on total wagered
     */
    function _updateVIPTier(address player) internal {
        uint256 totalWagered = playerStats[player].totalWagered;
        uint8 newTier;

        if (totalWagered >= VIP_TIER3_THRESHOLD) {
            newTier = 3;
        } else if (totalWagered >= VIP_TIER2_THRESHOLD) {
            newTier = 2;
        } else if (totalWagered >= VIP_TIER1_THRESHOLD) {
            newTier = 1;
        } else {
            newTier = 0;
        }

        if (newTier != vipTier[player]) {
            vipTier[player] = newTier;
            emit VIPTierUpdated(player, newTier);
        }
    }

    /**
     * @dev Check and mint achievements
     */
    function _checkAchievements(address player) internal {
        PlayerStats storage stats = playerStats[player];

        // First win
        if (stats.wins == 1) {
            achievementContract.mintAchievement(player, 1); // First Blood
        }

        // Win milestones
        if (stats.wins == 10) {
            achievementContract.mintAchievement(player, 2); // Warrior
        }
        if (stats.wins == 100) {
            achievementContract.mintAchievement(player, 3); // Champion
        }
        if (stats.wins == 1000) {
            achievementContract.mintAchievement(player, 4); // Legend
        }

        // Streak achievements
        if (stats.currentStreak == 5) {
            achievementContract.mintAchievement(player, 5); // Hot Streak
        }
        if (stats.currentStreak == 10) {
            achievementContract.mintAchievement(player, 6); // Unstoppable
        }

        // ELO achievements
        if (stats.eloRating >= 1500) {
            achievementContract.mintAchievement(player, 7); // Master
        }
        if (stats.eloRating >= 2000) {
            achievementContract.mintAchievement(player, 8); // Grandmaster
        }
    }

    // ============ Tournament Functions ============

    /**
     * @notice Create a new tournament
     */
    function createTournament(
        string memory name,
        uint256 entryFee,
        uint256 startTime,
        uint256 duration,
        TournamentType tournamentType
    ) external onlyOwner returns (uint256) {
        require(startTime > block.timestamp, "Invalid start time");

        tournamentCounter++;
        Tournament storage tournament = tournaments[tournamentCounter];
        tournament.id = tournamentCounter;
        tournament.name = name;
        tournament.entryFee = entryFee;
        tournament.startTime = startTime;
        tournament.endTime = startTime + duration;
        tournament.status = TournamentStatus.Pending;
        tournament.tournamentType = tournamentType;

        emit TournamentCreated(tournamentCounter, name, entryFee);

        return tournamentCounter;
    }

    /**
     * @notice Join a tournament
     */
    function joinTournament(uint256 tournamentId) external payable whenNotPaused rateLimited {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.Pending, "Tournament not open");
        require(block.timestamp < tournament.startTime, "Tournament already started");
        require(!tournament.isParticipant[msg.sender], "Already joined");
        require(msg.value == tournament.entryFee, "Incorrect entry fee");

        tournament.participants.push(msg.sender);
        tournament.isParticipant[msg.sender] = true;
        tournament.prizePool += msg.value;

        emit TournamentJoined(tournamentId, msg.sender);
    }

    /**
     * @notice Start a tournament (owner only)
     */
    function startTournament(uint256 tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.Pending, "Invalid status");
        require(block.timestamp >= tournament.startTime, "Too early");
        require(tournament.participants.length >= 2, "Not enough participants");

        tournament.status = TournamentStatus.Active;
    }

    /**
     * @notice Update tournament score (called internally or by oracle)
     */
    function updateTournamentScore(uint256 tournamentId, address player, uint256 score) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.Active, "Tournament not active");
        require(tournament.isParticipant[player], "Not a participant");

        tournament.scores[player] += score;
    }

    /**
     * @notice Complete tournament and distribute prizes
     */
    function completeTournament(uint256 tournamentId, address[] memory winners) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.status == TournamentStatus.Active, "Tournament not active");
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        require(winners.length > 0 && winners.length <= 10, "Invalid winners count");

        tournament.status = TournamentStatus.Completed;

        // Distribute prizes (50% to 1st, 30% to 2nd, 20% to 3rd, etc.)
        uint256[] memory percentages = new uint256[](winners.length);
        if (winners.length == 1) {
            percentages[0] = 100;
        } else if (winners.length == 2) {
            percentages[0] = 70;
            percentages[1] = 30;
        } else {
            percentages[0] = 50;
            percentages[1] = 30;
            percentages[2] = 20;
        }

        for (uint256 i = 0; i < winners.length && i < 3; i++) {
            uint256 prize = (tournament.prizePool * percentages[i]) / 100;
            (bool success, ) = winners[i].call{value: prize}("");
            require(success, "Prize transfer failed");
        }

        emit TournamentCompleted(tournamentId, winners);
    }

    // ============ View Functions ============

    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }

    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    function getPlayerBattles(address player) external view returns (uint256[] memory) {
        return playerBattles[player];
    }

    function getLeaderboard(uint256 limit) external view returns (address[] memory, uint256[] memory) {
        uint256 count = limit > leaderboard.length ? leaderboard.length : limit;
        address[] memory topPlayers = new address[](count);
        uint256[] memory topElos = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            topPlayers[i] = leaderboard[i];
            topElos[i] = playerStats[leaderboard[i]].eloRating;
        }

        return (topPlayers, topElos);
    }

    function getTournament(uint256 tournamentId) external view returns (
        uint256 id,
        string memory name,
        uint256 entryFee,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime,
        address[] memory participants,
        TournamentStatus status,
        TournamentType tournamentType
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.id,
            tournament.name,
            tournament.entryFee,
            tournament.prizePool,
            tournament.startTime,
            tournament.endTime,
            tournament.participants,
            tournament.status,
            tournament.tournamentType
        );
    }

    function getTournamentScore(uint256 tournamentId, address player) external view returns (uint256) {
        return tournaments[tournamentId].scores[player];
    }

    function getReferralEarnings(address referrer) external view returns (uint256) {
        return referralEarnings[referrer];
    }

    function getVIPTier(address player) external view returns (uint8) {
        return vipTier[player];
    }

    // ============ Admin Functions ============

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function withdrawTreasury(address to, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= treasuryBalance, "Insufficient treasury");
        treasuryBalance -= amount;

        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit TreasuryWithdrawal(to, amount);
    }

    function withdrawReferralEarnings() external nonReentrant {
        uint256 earnings = referralEarnings[msg.sender];
        require(earnings > 0, "No earnings");

        referralEarnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: earnings}("");
        require(success, "Withdrawal failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setAchievementContract(address _achievementContract) external onlyOwner {
        achievementContract = IBattleAchievements(_achievementContract);
    }

    // Emergency withdrawal for stuck funds
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Emergency withdrawal failed");
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }

    receive() external payable {
        treasuryBalance += msg.value;
    }
}
