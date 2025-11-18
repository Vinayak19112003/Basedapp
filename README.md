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

## 🎮 Game Rules

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
