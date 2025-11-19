# PvP Battle Game DApp 🎮⚔️

A fast-paced, provably fair PvP battle game built on Base Chain featuring Rock-Paper-Scissors-Lizard-Spock mechanics with crypto wagering, ELO ratings, tournaments, and achievement NFTs.

## 🌟 Features

### Smart Contracts
- **Commit-Reveal Pattern**: Prevents cheating with cryptographic commitments
- **Fair Payouts**: Winners receive 95% of pot, 5% to treasury
- **ELO Rating System**: Competitive rankings with proven algorithm
- **Tournament Mode**: Daily and weekly tournaments with prize pools
- **Achievement NFTs**: Soulbound tokens for milestones (100 wins, perfect streaks, etc.)
- **Referral System**: Earn 2% commission on referred player fees
- **VIP Tiers**: Volume-based tiers with special perks
- **Security**: Reentrancy guards, pause mechanism, rate limiting

### Frontend
- **Modern UI**: Cyber-themed dark mode with neon accents
- **Wallet Integration**: RainbowKit for seamless wallet connection
- **Real-time Updates**: Live battle status and leaderboard
- **Responsive Design**: Mobile-first approach
- **Animations**: Framer Motion for smooth transitions
- **Player Profiles**: Detailed stats and achievement showcase
- **Tournament Brackets**: Visual tournament progression

### Game Mechanics
1. Create a battle with ETH wager
2. Opponent joins and matches wager
3. Both commit moves (hashed for privacy)
4. Both reveal moves within time limit
5. Smart contract determines winner
6. Automatic payout + ELO update

## 📁 Project Structure

```
Basedapp/
├── contracts/          # Smart contracts
│   ├── src/           # Solidity contracts
│   ├── test/          # Contract tests
│   └── script/        # Deployment scripts
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js 14 app directory
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom hooks
│   │   ├── lib/       # Web3 configuration
│   │   ├── store/     # Zustand state management
│   │   ├── types/     # TypeScript types
│   │   └── utils/     # Helper functions
│   └── public/        # Static assets
├── subgraph/          # The Graph indexing
│   ├── schema/        # GraphQL schema
│   └── src/           # Mapping functions
└── scripts/           # Utility scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH (for testing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Basedapp
```

2. **Install contract dependencies**
```bash
cd contracts
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Configuration

1. **Contract Environment Variables**
```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=your_private_key_without_0x
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_MAINNET_RPC=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

2. **Frontend Environment Variables**
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT_ADDRESS=deployed_achievements_address
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

### Deployment

#### 1. Deploy Smart Contracts

**Compile contracts:**
```bash
cd contracts
npm run compile
```

**Run tests:**
```bash
npm test
```

**Deploy to Base Sepolia:**
```bash
npm run deploy:sepolia
```

**Deploy to Base Mainnet:**
```bash
npm run deploy:mainnet
```

**Verify contracts:**
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

#### 2. Run Frontend

**Development mode:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
npm start
```

### Deployment to Production

#### Vercel (Recommended for Frontend)
```bash
cd frontend
vercel
```

#### Contract Deployment Checklist
- [ ] Test thoroughly on testnet
- [ ] Audit smart contracts
- [ ] Set proper gas limits
- [ ] Fund deployer wallet
- [ ] Deploy Achievement contract first
- [ ] Deploy Game contract with Achievement address
- [ ] Authorize Game contract as minter
- [ ] Verify contracts on Basescan
- [ ] Update frontend environment variables
- [ ] Test all functionality on mainnet

## 🎮 How to Play

### Step-by-Step Guide for New Players

#### 1️⃣ **Set Up Your Wallet**

**First Time Setup:**
1. Install MetaMask browser extension from [metamask.io](https://metamask.io/)
2. Create a new wallet and **securely save your seed phrase**
3. Add Base Sepolia testnet to MetaMask:
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.basescan.org`

**Get Test ETH:**
1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Enter your wallet address
3. Receive free testnet ETH for playing

#### 2️⃣ **Connect to the Game**

1. Visit the game website
2. Click **"Connect Wallet"** button in the top right
3. Select your wallet (MetaMask, WalletConnect, etc.)
4. Approve the connection
5. Make sure you're on **Base Sepolia** network

✅ You're now connected and ready to battle!

---

### 3️⃣ **Creating Your First Battle**

**Navigate to the "Battles" tab and follow these steps:**

#### A. Set Your Wager
```
Min: 0.001 ETH  |  Max: 10 ETH
```
- Enter the amount you want to wager (e.g., `0.01` ETH)
- This is what you'll win from your opponent if you win
- Start small while learning!

#### B. Choose Your Move
Select one of five moves by clicking on it:

| Move | Emoji | Beats | Loses To |
|------|-------|-------|----------|
| **Rock** 🪨 | Crushes Scissors & Lizard | Paper & Spock |
| **Paper** 📄 | Covers Rock & Disproves Spock | Scissors & Lizard |
| **Scissors** ✂️ | Cuts Paper & Decapitates Lizard | Rock & Spock |
| **Lizard** 🦎 | Eats Paper & Poisons Spock | Rock & Scissors |
| **Spock** 🖖 | Smashes Scissors & Vaporizes Rock | Paper & Lizard |

**Important:** Once you submit, your move is **hidden** using cryptography. Your opponent can't see it!

#### C. Optional: Add a Referrer
- If someone referred you, enter their wallet address
- They'll earn 2% of the treasury fee
- Skip if you don't have one

#### D. Create Battle
1. Click **"Create Battle"** button
2. MetaMask will pop up asking to confirm transaction
3. Confirm and pay gas fee (very low on Base!)
4. Wait for confirmation (~2 seconds)

🎉 **Your battle is now live!** Wait for an opponent to join.

---

### 4️⃣ **Joining an Existing Battle**

**Browse the battle list to find an open battle:**

#### What to Look For:
- **Status**: "Waiting" (yellow badge)
- **Wager Amount**: Make sure you have enough ETH
- **Player 1**: Check their stats if you want

#### How to Join:
1. Click **"Join Battle"** button on any open battle
2. Select your move (same 5 options: Rock, Paper, Scissors, Lizard, Spock)
3. Click **"Join Battle"** in the modal
4. Confirm the transaction in MetaMask
   - You'll pay the wager amount + gas
   - Example: For 0.01 ETH battle, you pay 0.01 ETH

🔵 **Battle is now Active!** Both players must reveal their moves.

---

### 5️⃣ **Revealing Your Move**

**This is the most important step!**

#### When to Reveal:
- After both players have joined the battle
- Status changes to "Active" (blue badge)
- You have **5 minutes** to reveal

#### How to Reveal:
1. Find your battle in the list
2. Click **"Reveal Move"** button (it will be pulsing)
3. Confirm the transaction in MetaMask
4. Your hidden move is now revealed!

**⚠️ Critical:**
- You **MUST** reveal within 5 minutes
- If you don't reveal, your opponent wins automatically
- If neither player reveals, both get refunded

---

### 6️⃣ **Battle Resolution**

**Once both players reveal:**

#### The Smart Contract Determines the Winner:
✅ **You Win:**
- Receive **95% of the total pot** (your wager + opponent's wager)
- Example: 0.01 ETH battle → you get 0.019 ETH back (95% of 0.02 ETH)
- Your ELO rating increases
- Stats updated (wins, streak, etc.)
- Automatic achievement NFTs minted

❌ **You Lose:**
- Lose your wager
- ELO rating decreases
- Streak resets
- Try again and improve!

🤝 **Draw:**
- Both players selected the same move
- Both get their wagers back (refunded)
- No ELO change

#### Payouts are Instant:
- ETH automatically sent to winner's wallet
- No claiming needed
- Check your wallet to see the winnings!

---

### 7️⃣ **Timeout Scenarios**

**What if opponent doesn't reveal?**

After 5 minutes, if your opponent hasn't revealed but you have:
1. Click **"Claim Timeout"** button
2. You automatically win the battle
3. Receive full payout
4. Opponent loses their wager

**What if YOU forget to reveal?**
- You forfeit the battle
- Opponent can claim timeout win
- You lose your wager
- ⚠️ Set a timer! Don't forget!

**What if neither player reveals?**
- After 5 minutes, battle expires
- Both players get full refunds
- No penalties

---

### 🎯 Game Strategy Tips

#### For Beginners:
1. **Start Small**: Use minimum wager (0.001 ETH) to learn
2. **Reveal Quickly**: Don't wait until the last second
3. **Track Patterns**: Some players have tendencies
4. **Check Stats**: Review opponent's win rate before joining
5. **Mind Your Streak**: Protect winning streaks for achievements

#### Advanced Strategy:
- **Rock** is most common - counter with **Paper** or **Spock**
- **Lizard** is least expected - use for surprise
- **Spock** beats two moves that beat Rock
- Vary your moves to be unpredictable
- Higher ELO players are tougher opponents

#### Psychology:
- First-time players often choose **Rock** (test this theory!)
- Players on losing streaks may play safe
- High-stakes battles attract skilled players
- Tournament play is more competitive

---

### 📊 Understanding Your Stats

**Navigate to "Profile" tab to see:**

#### Key Metrics:
- **ELO Rating**: Your skill level (starts at 1000)
  - 1000-1200: Beginner
  - 1200-1500: Intermediate
  - 1500-1800: Advanced
  - 1800+: Expert

- **Win Rate**: Wins ÷ Total Battles × 100
  - 50%+ is good
  - 60%+ is excellent
  - 70%+ is elite

- **Current Streak**: Consecutive wins
  - 5+ wins = "Hot Streak" achievement
  - 10+ wins = "Unstoppable" achievement

- **VIP Tier**: Based on total wagered
  - Bronze: 1 ETH total wagered
  - Silver: 10 ETH total wagered
  - Gold: 100 ETH total wagered

---

### 🏆 Earning Achievements

**Soulbound NFTs automatically minted when you:**

| Achievement | Requirement | Rarity | Tips |
|-------------|-------------|--------|------|
| 🩸 First Blood | Win 1st battle | Common | Just win once! |
| ⚔️ Warrior | Win 10 battles | Rare | Keep playing |
| 👑 Champion | Win 100 battles | Epic | Dedication required |
| 🌟 Legend | Win 1000 battles | Legendary | Ultimate goal |
| 🔥 Hot Streak | 5 win streak | Rare | Don't lose! |
| ⚡ Unstoppable | 10 win streak | Epic | Very challenging |
| 🎓 Master | 1500 ELO | Epic | Beat top players |
| 💎 Grandmaster | 2000 ELO | Legendary | Elite tier |

**View Your Achievements:**
- Go to "Profile" tab
- Scroll to "Achievements" section
- NFTs display automatically
- They're in your wallet forever (non-transferable)

---

### 🎪 Playing Tournaments

**Navigate to "Tournaments" tab:**

#### Types of Tournaments:

**Daily Free Tournament**
- Entry: FREE (0 ETH)
- Prize Pool: Funded by treasury
- Start Time: Every day at 18:00 UTC
- Format: Swiss or Elimination
- Top 3 winners split prize pool

**Weekly Championship**
- Entry Fee: 0.1 ETH
- Larger prize pools
- Saturdays at 12:00 UTC
- More competitive players

#### How to Enter:
1. Find active tournament
2. Click **"Join Tournament"**
3. Pay entry fee (if applicable)
4. Wait for start time
5. Play your matches
6. Top scores win prizes!

**Tournament Scoring:**
- Each win gives points
- Higher ELO opponents = more points
- Draws give half points
- Rankings updated live

---

### ⚠️ Common Mistakes to Avoid

❌ **DON'T:**
- Forget to reveal your move (you'll lose!)
- Wager more than you can afford to lose
- Play on wrong network (must be Base Sepolia/Mainnet)
- Close browser during battle
- Share your private keys with anyone
- Rage-bet after losses

✅ **DO:**
- Set a timer for reveals
- Start with small wagers
- Double-check your move selection
- Keep some ETH for gas fees
- Read opponent stats
- Have fun and play responsibly!

---

### 🆘 Troubleshooting

**"Transaction Failed"**
- Check you have enough ETH for wager + gas
- Make sure you're on correct network
- Try increasing gas limit

**"Can't Connect Wallet"**
- Refresh the page
- Check MetaMask is unlocked
- Try different browser
- Clear cache and cookies

**"Battle Not Updating"**
- Refresh the page
- Check transaction on Basescan
- Wait for block confirmation (~2 seconds)

**"Lost My Battle Data"**
- Check browser's localStorage wasn't cleared
- Your battles are on the blockchain (safe!)
- Stats always recoverable

**"Opponent Not Revealing"**
- Wait full 5 minutes
- Click "Claim Timeout" button
- You'll win automatically

---

### 📱 Mobile Play

**The game is fully mobile-responsive:**

✅ **Supported Browsers:**
- MetaMask mobile browser
- Trust Wallet browser
- Coinbase Wallet browser
- WalletConnect compatible

**Mobile Tips:**
- Use landscape mode for better view
- Tap moves carefully
- Keep app open during reveals
- Enable notifications (coming soon)

---

### 💰 Economics Explained

**Example Battle with 0.01 ETH wager:**

```
Your Wager:        0.01 ETH
Opponent Wager:    0.01 ETH
─────────────────────────────
Total Pot:         0.02 ETH

If You Win:
  Payout:          0.019 ETH (95%)
  Net Profit:      +0.009 ETH
  Treasury Fee:    0.001 ETH (5%)

If You Lose:
  Loss:           -0.01 ETH
  Opponent Gets:   0.019 ETH
```

**Referral Bonus:**
- If you referred a player: +2% of treasury fee
- Example: 0.00002 ETH per battle they play
- Passive income from active referrals!

---

### 🎓 Quick Reference Card

**Create Battle:** Wager → Move → Create → Wait

**Join Battle:** Find → Move → Join → Confirm

**Reveal:** Wait for Active → Reveal → Win!

**Timeout:** Wait 5 min → Claim → Profit

**Check Stats:** Profile Tab → View All Data

**Remember:**
- ⏰ 5 minutes to reveal
- 🎯 95% payout to winner
- 🏆 Achievements auto-mint
- 💯 Start small, learn, win big!

---

## 🎮 Game Rules Reference

### Rock-Paper-Scissors-Lizard-Spock

**Winning Combinations:**
- 🪨 Rock: Crushes Scissors, Crushes Lizard
- 📄 Paper: Covers Rock, Disproves Spock
- ✂️ Scissors: Cuts Paper, Decapitates Lizard
- 🦎 Lizard: Eats Paper, Poisons Spock
- 🖖 Spock: Smashes Scissors, Vaporizes Rock

### Wagering
- Minimum: 0.001 ETH
- Maximum: 10 ETH
- Winner gets: 95% of total pot
- Treasury fee: 5%

### ELO Rating
- Starting ELO: 1000
- K-factor: 32
- Updates after each battle
- Higher stakes = more competitive

### Timeouts
- Reveal timeout: 5 minutes
- If opponent doesn't reveal: Claim timeout win
- If neither reveals: Both refunded

## 🏆 Achievements

| ID | Name | Description | Rarity |
|----|------|-------------|--------|
| 1 | First Blood | Win your first battle | Common |
| 2 | Warrior | Win 10 battles | Rare |
| 3 | Champion | Win 100 battles | Epic |
| 4 | Legend | Win 1000 battles | Legendary |
| 5 | Hot Streak | Win 5 in a row | Rare |
| 6 | Unstoppable | Win 10 in a row | Epic |
| 7 | Master | Reach 1500 ELO | Epic |
| 8 | Grandmaster | Reach 2000 ELO | Legendary |

## 🔒 Security

### Smart Contract Security
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- **Pause Mechanism**: Emergency stop functionality
- **Commit-Reveal**: Prevents front-running and cheating
- **Rate Limiting**: 1-second cooldown between actions
- **Input Validation**: Wager limits, move validation
- **Access Control**: Owner-only functions

### Best Practices
- Never share your private key
- Verify contract addresses before interacting
- Start with small wagers to test
- Keep browser extensions updated
- Use hardware wallet for large amounts

## 📊 Contract Addresses

### Base Sepolia Testnet
```
PvPBattleGame: [Deployed after setup]
BattleAchievements: [Deployed after setup]
```

### Base Mainnet
```
PvPBattleGame: [TBD]
BattleAchievements: [TBD]
```

## 🛠️ Development

### Running Tests
```bash
cd contracts
npm test
```

### Gas Reporting
```bash
REPORT_GAS=true npm test
```

### Coverage
```bash
npm run coverage
```

### Linting
```bash
cd frontend
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## 📈 The Graph Integration

### Deploy Subgraph
```bash
cd subgraph
graph auth --studio <DEPLOY_KEY>
graph codegen
graph build
graph deploy --studio pvp-battle-game
```

### Query Examples
```graphql
# Get top players
query {
  players(first: 10, orderBy: eloRating, orderDirection: desc) {
    id
    wins
    losses
    eloRating
  }
}

# Get recent battles
query {
  battles(first: 20, orderBy: createdAt, orderDirection: desc) {
    id
    player1 { id }
    player2 { id }
    wager
    status
    winner { id }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built on [Base](https://base.org/) - Ethereum L2
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [The Graph](https://thegraph.com/) - Indexing protocol

## 📞 Support

For support, please open an issue on GitHub or join our Discord community.

## 🎯 Roadmap

- [x] Core battle mechanics
- [x] ELO rating system
- [x] Achievement NFTs
- [x] Tournament mode
- [x] Referral system
- [ ] Mobile app (React Native)
- [ ] Spectator mode with live streaming
- [ ] Advanced tournament formats
- [ ] Token-based rewards ($BATTLE)
- [ ] DAO governance
- [ ] Cross-chain support

## ⚠️ Disclaimer

This is a gambling DApp. Please play responsibly. Only wager what you can afford to lose. Check your local laws regarding online gambling and crypto wagering.

---

**Built with ❤️ on Base Chain**

*Fast. Fair. Fun.*
