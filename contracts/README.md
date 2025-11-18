# Smart Contracts

## Overview

The PvP Battle Game smart contracts implement a provably fair battle system using commit-reveal pattern, ELO ratings, tournaments, and achievement NFTs.

## Contracts

### PvPBattleGame.sol

Main game contract handling battles, wagers, and player statistics.

**Key Features:**
- Commit-reveal pattern for move hiding
- ETH/USDC wagering (USDC support via configuration)
- ELO rating calculation and leaderboard
- Tournament creation and management
- Referral system with commissions
- VIP tiers based on volume
- Emergency pause mechanism
- Reentrancy protection
- Rate limiting

**Main Functions:**

```solidity
// Create a new battle
function createBattle(
    uint256 wager,
    address tokenAddress,
    bytes32 commitHash,
    address referrer
) external payable returns (uint256)

// Join existing battle
function joinBattle(uint256 battleId, bytes32 commitHash) external payable

// Reveal your move
function revealMove(uint256 battleId, uint8 move, bytes32 salt) external

// Claim win if opponent times out
function claimTimeout(uint256 battleId) external

// Cancel unclaimed battle after 1 hour
function cancelBattle(uint256 battleId) external
```

**View Functions:**

```solidity
function getBattle(uint256 battleId) external view returns (Battle memory)
function getPlayerStats(address player) external view returns (PlayerStats memory)
function getLeaderboard(uint256 limit) external view returns (address[], uint256[])
function getTournament(uint256 tournamentId) external view returns (...)
```

### BattleAchievements.sol

ERC-721 NFT contract for battle achievements. Tokens are soulbound (non-transferable).

**Achievement IDs:**
1. First Blood - Win first battle
2. Warrior - 10 wins
3. Champion - 100 wins
4. Legend - 1000 wins
5. Hot Streak - 5 win streak
6. Unstoppable - 10 win streak
7. Master - 1500 ELO
8. Grandmaster - 2000 ELO

**Functions:**

```solidity
// Mint achievement (authorized minters only)
function mintAchievement(address to, uint256 achievementId) external

// Check if player has achievement
function hasAchievement(address player, uint256 achievementId) external view returns (bool)

// Get all achievements for player
function getPlayerAchievements(address player) external view returns (uint256[])
```

## Deployment

### Local Development

1. Start Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat run script/deploy.js --network localhost
```

### Testnet (Base Sepolia)

```bash
npm run deploy:sepolia
```

### Mainnet (Base)

```bash
npm run deploy:mainnet
```

## Testing

Run all tests:
```bash
npm test
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

Run with coverage:
```bash
npm run coverage
```

## Gas Optimization

The contracts are optimized for gas efficiency:

- Packed storage variables
- Minimal external calls
- Efficient loops
- Event emission for indexing instead of storage

**Estimated Gas Costs:**
- Create Battle: ~150k gas
- Join Battle: ~120k gas
- Reveal Move: ~80k gas
- Claim Timeout: ~60k gas

## Security Considerations

### Commit-Reveal Pattern

Players commit a hash of their move:
```solidity
bytes32 commitHash = keccak256(abi.encodePacked(move, salt, playerAddress));
```

This prevents:
- Front-running
- Move copying
- Cheating via transaction ordering

### Timeout Mechanism

- 5-minute reveal window after battle becomes active
- Players who don't reveal forfeit the battle
- If both fail to reveal, both get refunded

### Rate Limiting

1-second cooldown between actions prevents spam and potential exploits.

### Reentrancy Protection

All state-changing functions use OpenZeppelin's ReentrancyGuard.

### Emergency Controls

Owner can pause contract in case of emergency. Existing battles can still be completed during pause.

## Economic Model

### Fee Structure

- Winner: 95% of pot
- Treasury: 5% of pot
- Referrer: 2% of treasury fee (if applicable)

Example with 0.1 ETH wager (0.2 ETH total pot):
- Winner receives: 0.19 ETH
- Treasury: 0.01 ETH
- Referrer (if exists): 0.0002 ETH

### VIP Tiers

| Tier | Requirement | Benefits |
|------|-------------|----------|
| Standard | 0 ETH | Base features |
| Bronze | 1 ETH wagered | Priority matching |
| Silver | 10 ETH wagered | Reduced fees (coming soon) |
| Gold | 100 ETH wagered | Exclusive tournaments |

### ELO Calculation

Standard ELO system with K-factor of 32:
```solidity
newElo = oldElo + K * (actualScore - expectedScore)
```

Where:
- K = 32
- actualScore = 1 (win), 0 (loss), 0.5 (draw)
- expectedScore calculated from ELO difference

## Admin Functions

### Owner Only

```solidity
// Pause/unpause contract
function pause() external onlyOwner
function unpause() external onlyOwner

// Withdraw treasury
function withdrawTreasury(address to, uint256 amount) external onlyOwner

// Manage supported tokens
function addSupportedToken(address token) external onlyOwner
function removeSupportedToken(address token) external onlyOwner

// Tournament management
function createTournament(...) external onlyOwner
function startTournament(uint256 tournamentId) external onlyOwner
function completeTournament(uint256 tournamentId, address[] winners) external onlyOwner
```

### Achievement Contract Admin

```solidity
// Authorize minters (e.g., game contract)
function authorizeMinter(address minter) external onlyOwner
function revokeMinter(address minter) external onlyOwner

// Add new achievements
function addAchievement(uint256 id, string name, ...) external onlyOwner
```

## Upgrade Path

Contracts are not upgradeable by design for security and trust. If upgrades are needed:

1. Deploy new contracts
2. Pause old contracts
3. Migrate state if necessary
4. Update frontend to use new contracts

## Audit Recommendations

Before mainnet deployment, get audited for:

- Reentrancy vulnerabilities
- Integer overflow/underflow (though Solidity 0.8+ has built-in protection)
- Front-running possibilities
- Griefing attack vectors
- Economic exploits
- Access control issues

Recommended auditors:
- OpenZeppelin
- Trail of Bits
- Consensys Diligence
- Certik

## Integration Examples

### Creating a Battle (ethers.js)

```javascript
const wager = ethers.parseEther("0.01");
const move = 1; // Rock
const salt = ethers.encodeBytes32String("my_secret");
const commitHash = ethers.keccak256(
  ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint8", "bytes32", "address"],
    [move, salt, playerAddress]
  )
);

const tx = await gameContract.createBattle(
  wager,
  ethers.ZeroAddress, // ETH
  commitHash,
  ethers.ZeroAddress, // No referrer
  { value: wager }
);
```

### Revealing a Move

```javascript
const battleId = 1;
const move = 1; // Rock
const salt = ethers.encodeBytes32String("my_secret");

const tx = await gameContract.revealMove(battleId, move, salt);
```

## Events

All major actions emit events for indexing:

```solidity
event BattleCreated(uint256 indexed battleId, address indexed player1, uint256 wager, address token);
event BattleJoined(uint256 indexed battleId, address indexed player2);
event MoveRevealed(uint256 indexed battleId, address indexed player, uint8 move);
event BattleCompleted(uint256 indexed battleId, address indexed winner, uint256 payout);
event EloUpdated(address indexed player, uint256 oldElo, uint256 newElo);
```

Use these events to:
- Update UI in real-time
- Build analytics dashboards
- Create activity feeds
- Index with The Graph

## Troubleshooting

### Common Issues

**"Action too frequent"**
- Wait 1 second between transactions

**"Invalid reveal"**
- Ensure move and salt match the original commit
- Check that you're using the correct player address

**"Reveal period expired"**
- You have 5 minutes to reveal after battle starts
- Use `claimTimeout` to win if opponent hasn't revealed

**"Incorrect ETH amount"**
- Send exact wager amount when creating/joining battles

## License

MIT License - see LICENSE file for details
