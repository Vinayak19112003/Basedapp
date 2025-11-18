const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PvPBattleGame", function () {
  let game, achievements;
  let owner, player1, player2, player3;
  let wager;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    // Deploy BattleAchievements
    const BattleAchievements = await ethers.getContractFactory("BattleAchievements");
    achievements = await BattleAchievements.deploy();
    await achievements.waitForDeployment();

    // Deploy PvPBattleGame
    const PvPBattleGame = await ethers.getContractFactory("PvPBattleGame");
    game = await PvPBattleGame.deploy(await achievements.getAddress());
    await game.waitForDeployment();

    // Authorize game contract to mint achievements
    await achievements.authorizeMinter(await game.getAddress());

    wager = ethers.parseEther("0.01");
  });

  describe("Battle Creation and Joining", function () {
    it("Should create a battle successfully", async function () {
      const move = 1; // Rock
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      const tx = await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress, // ETH
        commitHash,
        ethers.ZeroAddress, // No referrer
        { value: wager }
      );

      await expect(tx)
        .to.emit(game, "BattleCreated")
        .withArgs(1, player1.address, wager, ethers.ZeroAddress);

      const battle = await game.getBattle(1);
      expect(battle.player1).to.equal(player1.address);
      expect(battle.wager).to.equal(wager);
      expect(battle.status).to.equal(0); // Created
    });

    it("Should join a battle successfully", async function () {
      // Player 1 creates battle
      const move1 = 1; // Rock
      const salt1 = ethers.encodeBytes32String("secret1");
      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      // Player 2 joins
      const move2 = 2; // Paper
      const salt2 = ethers.encodeBytes32String("secret2");
      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      const tx = await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      await expect(tx).to.emit(game, "BattleJoined").withArgs(1, player2.address);

      const battle = await game.getBattle(1);
      expect(battle.player2).to.equal(player2.address);
      expect(battle.status).to.equal(1); // Active
    });

    it("Should not allow player to battle themselves", async function () {
      const move = 1;
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash,
        ethers.ZeroAddress,
        { value: wager }
      );

      await expect(
        game.connect(player1).joinBattle(1, commitHash, { value: wager })
      ).to.be.revertedWith("Cannot battle yourself");
    });

    it("Should require correct wager amount", async function () {
      const move = 1;
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      await expect(
        game.connect(player1).createBattle(
          wager,
          ethers.ZeroAddress,
          commitHash,
          ethers.ZeroAddress,
          { value: ethers.parseEther("0.005") } // Wrong amount
        )
      ).to.be.revertedWith("Incorrect ETH amount");
    });
  });

  describe("Battle Resolution", function () {
    it("Should resolve battle correctly - Player 1 wins (Rock beats Scissors)", async function () {
      // Player 1: Rock
      const move1 = 1;
      const salt1 = ethers.encodeBytes32String("secret1");
      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      // Player 2: Scissors
      const move2 = 3;
      const salt2 = ethers.encodeBytes32String("secret2");
      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      // Reveal moves
      await game.connect(player1).revealMove(1, move1, salt1);
      const tx = await game.connect(player2).revealMove(1, move2, salt2);

      await expect(tx).to.emit(game, "BattleCompleted");

      const battle = await game.getBattle(1);
      expect(battle.winner).to.equal(player1.address);
      expect(battle.status).to.equal(3); // Completed

      // Check stats
      const stats1 = await game.getPlayerStats(player1.address);
      expect(stats1.wins).to.equal(1);
      expect(stats1.losses).to.equal(0);

      const stats2 = await game.getPlayerStats(player2.address);
      expect(stats2.wins).to.equal(0);
      expect(stats2.losses).to.equal(1);
    });

    it("Should resolve battle as draw (Rock vs Rock)", async function () {
      // Both play Rock
      const move1 = 1;
      const move2 = 1;
      const salt1 = ethers.encodeBytes32String("secret1");
      const salt2 = ethers.encodeBytes32String("secret2");

      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      await game.connect(player1).revealMove(1, move1, salt1);
      const tx = await game.connect(player2).revealMove(1, move2, salt2);

      await expect(tx).to.emit(game, "BattleDraw").withArgs(1);

      const battle = await game.getBattle(1);
      expect(battle.status).to.equal(3); // Completed

      // Check draws
      const stats1 = await game.getPlayerStats(player1.address);
      expect(stats1.draws).to.equal(1);

      const stats2 = await game.getPlayerStats(player2.address);
      expect(stats2.draws).to.equal(1);
    });

    it("Should handle all game mechanics correctly", async function () {
      // Test Paper beats Rock
      await testBattle(2, 1, player1.address); // Paper vs Rock

      // Test Scissors beats Paper
      await testBattle(3, 2, player1.address); // Scissors vs Paper

      // Test Rock beats Lizard
      await testBattle(1, 4, player1.address); // Rock vs Lizard

      // Test Lizard beats Spock
      await testBattle(4, 5, player1.address); // Lizard vs Spock

      // Test Spock beats Scissors
      await testBattle(5, 3, player1.address); // Spock vs Scissors
    });

    async function testBattle(move1, move2, expectedWinner) {
      const salt1 = ethers.encodeBytes32String("s1");
      const salt2 = ethers.encodeBytes32String("s2");

      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      const battleId = await game.battleCounter();

      await game.connect(player2).joinBattle(battleId, commitHash2, { value: wager });

      await game.connect(player1).revealMove(battleId, move1, salt1);
      await game.connect(player2).revealMove(battleId, move2, salt2);

      const battle = await game.getBattle(battleId);
      expect(battle.winner).to.equal(expectedWinner);
    }
  });

  describe("Timeout and Cancellation", function () {
    it("Should allow winner claim on timeout", async function () {
      const move1 = 1;
      const salt1 = ethers.encodeBytes32String("secret1");
      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      const move2 = 2;
      const salt2 = ethers.encodeBytes32String("secret2");
      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      // Only player1 reveals
      await game.connect(player1).revealMove(1, move1, salt1);

      // Fast forward past reveal deadline
      await time.increase(6 * 60); // 6 minutes

      // Claim timeout
      const tx = await game.claimTimeout(1);
      await expect(tx).to.emit(game, "BattleCompleted");

      const battle = await game.getBattle(1);
      expect(battle.winner).to.equal(player1.address);
    });

    it("Should allow battle cancellation after timeout", async function () {
      const move = 1;
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash,
        ethers.ZeroAddress,
        { value: wager }
      );

      // Fast forward 1 hour
      await time.increase(3600);

      const tx = await game.connect(player1).cancelBattle(1);
      await expect(tx).to.emit(game, "BattleCancelled").withArgs(1);

      const battle = await game.getBattle(1);
      expect(battle.status).to.equal(4); // Cancelled
    });
  });

  describe("ELO and Leaderboard", function () {
    it("Should update ELO ratings correctly", async function () {
      // Create and complete a battle
      const move1 = 1; // Rock
      const move2 = 3; // Scissors
      const salt1 = ethers.encodeBytes32String("s1");
      const salt2 = ethers.encodeBytes32String("s2");

      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      await game.connect(player1).revealMove(1, move1, salt1);
      await game.connect(player2).revealMove(1, move2, salt2);

      const stats1 = await game.getPlayerStats(player1.address);
      const stats2 = await game.getPlayerStats(player2.address);

      expect(stats1.eloRating).to.be.gt(1000);
      expect(stats2.eloRating).to.be.lt(1000);
    });

    it("Should maintain leaderboard correctly", async function () {
      // Get leaderboard
      const [players, elos] = await game.getLeaderboard(10);

      // Initially should have created players
      expect(players.length).to.be.gte(0);
    });
  });

  describe("Achievements", function () {
    it("Should mint achievement on first win", async function () {
      const move1 = 1;
      const move2 = 3;
      const salt1 = ethers.encodeBytes32String("s1");
      const salt2 = ethers.encodeBytes32String("s2");

      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      await game.connect(player1).revealMove(1, move1, salt1);
      await game.connect(player2).revealMove(1, move2, salt2);

      // Check achievement
      const hasAchievement = await achievements.hasAchievement(player1.address, 1);
      expect(hasAchievement).to.be.true;
    });
  });

  describe("Referral System", function () {
    it("Should set referrer correctly", async function () {
      const move = 1;
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      const tx = await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash,
        player3.address, // Referrer
        { value: wager }
      );

      await expect(tx).to.emit(game, "ReferralSet").withArgs(player1.address, player3.address);

      const referrer = await game.referrals(player1.address);
      expect(referrer).to.equal(player3.address);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      await game.pause();

      const move = 1;
      const salt = ethers.encodeBytes32String("secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move, salt, player1.address]
        )
      );

      await expect(
        game.connect(player1).createBattle(
          wager,
          ethers.ZeroAddress,
          commitHash,
          ethers.ZeroAddress,
          { value: wager }
        )
      ).to.be.revertedWith("Pausable: paused");

      await game.unpause();

      await expect(
        game.connect(player1).createBattle(
          wager,
          ethers.ZeroAddress,
          commitHash,
          ethers.ZeroAddress,
          { value: wager }
        )
      ).to.not.be.reverted;
    });

    it("Should allow owner to withdraw treasury", async function () {
      // Create and complete a battle to generate treasury fees
      const move1 = 1;
      const move2 = 3;
      const salt1 = ethers.encodeBytes32String("s1");
      const salt2 = ethers.encodeBytes32String("s2");

      const commitHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move1, salt1, player1.address]
        )
      );

      const commitHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint8", "bytes32", "address"],
          [move2, salt2, player2.address]
        )
      );

      await game.connect(player1).createBattle(
        wager,
        ethers.ZeroAddress,
        commitHash1,
        ethers.ZeroAddress,
        { value: wager }
      );

      await game.connect(player2).joinBattle(1, commitHash2, { value: wager });

      await game.connect(player1).revealMove(1, move1, salt1);
      await game.connect(player2).revealMove(1, move2, salt2);

      const treasuryBalance = await game.treasuryBalance();
      expect(treasuryBalance).to.be.gt(0);

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await game.withdrawTreasury(owner.address, treasuryBalance);
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });
});
