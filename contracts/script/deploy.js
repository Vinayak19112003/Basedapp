const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy BattleAchievements contract first
  console.log("\n📜 Deploying BattleAchievements...");
  const BattleAchievements = await hre.ethers.getContractFactory("BattleAchievements");
  const achievements = await BattleAchievements.deploy();
  await achievements.waitForDeployment();
  const achievementsAddress = await achievements.getAddress();
  console.log("✅ BattleAchievements deployed to:", achievementsAddress);

  // Deploy PvPBattleGame contract
  console.log("\n📜 Deploying PvPBattleGame...");
  const PvPBattleGame = await hre.ethers.getContractFactory("PvPBattleGame");
  const game = await PvPBattleGame.deploy(achievementsAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("✅ PvPBattleGame deployed to:", gameAddress);

  // Authorize game contract to mint achievements
  console.log("\n🔐 Authorizing game contract as minter...");
  const authTx = await achievements.authorizeMinter(gameAddress);
  await authTx.wait();
  console.log("✅ Game contract authorized");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PvPBattleGame: gameAddress,
      BattleAchievements: achievementsAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  // Copy to frontend
  const frontendDeploymentsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendDeploymentsDir)) {
    fs.mkdirSync(frontendDeploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDeploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info copied to frontend");

  // Copy ABIs to frontend
  const artifactsDir = path.join(__dirname, "../artifacts/src");
  const gameArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "PvPBattleGame.sol/PvPBattleGame.json"))
  );
  const achievementsArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "BattleAchievements.sol/BattleAchievements.json"))
  );

  fs.writeFileSync(
    path.join(frontendDeploymentsDir, "PvPBattleGame.json"),
    JSON.stringify(gameArtifact.abi, null, 2)
  );
  fs.writeFileSync(
    path.join(frontendDeploymentsDir, "BattleAchievements.json"),
    JSON.stringify(achievementsArtifact.abi, null, 2)
  );
  console.log("💾 ABIs copied to frontend");

  console.log("\n✨ Deployment complete!");
  console.log("\n📋 Summary:");
  console.log("  Network:", hre.network.name);
  console.log("  PvPBattleGame:", gameAddress);
  console.log("  BattleAchievements:", achievementsAddress);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await achievements.deploymentTransaction().wait(5);
    await game.deploymentTransaction().wait(5);

    console.log("\n🔍 Verifying contracts on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: achievementsAddress,
        constructorArguments: [],
      });
      console.log("✅ BattleAchievements verified");
    } catch (error) {
      console.log("⚠️  BattleAchievements verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: gameAddress,
        constructorArguments: [achievementsAddress],
      });
      console.log("✅ PvPBattleGame verified");
    } catch (error) {
      console.log("⚠️  PvPBattleGame verification failed:", error.message);
    }
  }

  console.log("\n🎉 All done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
