# PvP Battle Game Frontend

Modern, responsive frontend for the PvP Battle Game built with Next.js 14, TypeScript, and TailwindCSS.

## Features

- **Wallet Connection**: RainbowKit integration with MetaMask, WalletConnect, Coinbase Wallet
- **Real-time Updates**: Live battle status and leaderboard updates
- **Responsive Design**: Mobile-first approach with cyber-themed dark mode
- **Animations**: Smooth transitions with Framer Motion
- **State Management**: Zustand for global state
- **Type Safety**: Full TypeScript coverage
- **Web3 Integration**: Wagmi hooks for contract interactions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi, Viem, RainbowKit
- **State**: Zustand
- **Animations**: Framer Motion
- **UI Components**: Custom components with Lucide icons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Web3 wallet (MetaMask, etc.)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure variables:

```env
# Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract addresses (from deployment)
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT_ADDRESS=0x...

# Network config
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Web3 and app providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── battle/           # Battle-related components
│   │   ├── CreateBattle.tsx
│   │   ├── BattleList.tsx
│   │   ├── BattleCard.tsx
│   │   └── MoveSelector.tsx
│   ├── leaderboard/      # Leaderboard components
│   │   └── Leaderboard.tsx
│   ├── profile/          # Player profile
│   │   └── PlayerProfile.tsx
│   └── tournament/       # Tournament components
│       └── TournamentList.tsx
├── hooks/                 # Custom React hooks
│   └── useGameContract.ts # Web3 contract hooks
├── lib/                   # Libraries and configs
│   └── wagmi.ts          # Wagmi configuration
├── store/                 # Zustand stores
│   └── battleStore.ts    # Battle state management
├── types/                 # TypeScript types
│   └── index.ts          # Shared types
├── utils/                 # Utility functions
│   └── helpers.ts        # Helper functions
└── contracts/             # Contract ABIs and addresses
```

## Key Components

### CreateBattle

Allows users to:
- Set wager amount (0.001-10 ETH)
- Select move (Rock, Paper, Scissors, Lizard, Spock)
- Optional referrer address
- Create battle transaction

### BattleCard

Displays battle information:
- Players and their status
- Wager amount
- Battle status (Created, Active, Completed)
- Actions (Join, Reveal Move, Claim Timeout)

### MoveSelector

Interactive move selection with:
- Visual move cards
- Move descriptions
- Selection animations
- Touch/click support

### Leaderboard

Shows top players:
- Ranking with medals (🥇🥈🥉)
- ELO ratings
- Win/loss records
- Trend indicators

### PlayerProfile

Comprehensive player stats:
- ELO rating and win rate
- Total battles, wins, losses, draws
- Current and best streaks
- VIP tier status
- Achievement badges

## Styling

### Theme

Cyber-punk inspired dark theme:
- Background: `#0a0e1a`
- Cards: `#141829`
- Borders: `#1e2435`
- Accent: Cyan (`#00ffff`)
- Secondary: Magenta (`#ff00ff`)

### Custom Classes

```css
.cyber-card           // Card with border and hover effect
.cyber-button         // Primary gradient button
.cyber-button-secondary // Outlined button
.neon-text           // Text with glow effect
.battle-move-card    // Move selection card
.stat-card           // Stat display card
```

### Animations

- `animate-glow`: Pulsing glow effect
- `animate-pulse-slow`: Slow pulse
- `animate-slide-up`: Slide from bottom
- `animate-battle-shake`: Shake effect

## Web3 Integration

### Contract Hooks

```typescript
// Read operations
const { data: battle } = useGetBattle(battleId);
const { data: stats } = useGetPlayerStats(address);
const { data: leaderboard } = useGetLeaderboard(100);

// Write operations
const { createBattle } = useGameContract();
await createBattle(wager, commitHash, referrer);
```

### Commit-Reveal Flow

1. **Create/Join**: Generate commit hash
   ```typescript
   const salt = generateRandomSalt();
   const commitHash = generateCommitHash(move, salt, address);
   ```

2. **Store Locally**: Save salt for reveal
   ```typescript
   localStorage.setItem(`battle_salt_${battleId}`, salt);
   ```

3. **Reveal**: Use stored salt
   ```typescript
   const salt = localStorage.getItem(`battle_salt_${battleId}`);
   await revealMove(battleId, move, salt);
   ```

## State Management

### Battle Store (Zustand)

```typescript
const {
  selectedMove,
  setSelectedMove,
  isCreatingBattle,
  soundEnabled,
  toggleSound
} = useBattleStore();
```

Manages:
- Selected move state
- Loading states
- Sound preferences
- Current battle salt

## Responsive Design

Breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

All components are mobile-first and fully responsive.

## Error Handling

### Transaction Errors

```typescript
try {
  await createBattle(wager, commitHash);
  toast.success('Battle created!');
} catch (error) {
  toast.error(error.message || 'Transaction failed');
}
```

### Network Errors

- Automatic retry for read operations
- User-friendly error messages
- Network switch prompts

## Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: Input handlers debounced

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Other Platforms

Build and deploy static export:

```bash
npm run build
# Upload .next/static to your hosting
```

### Environment Variables

Set in deployment platform:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_GAME_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`

## Testing

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Create battle transaction succeeds
- [ ] Join battle works
- [ ] Reveal move completes battle
- [ ] Leaderboard updates
- [ ] Profile shows correct stats
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Error handling works
- [ ] Toast notifications appear

## Troubleshooting

### Wallet Won't Connect

- Check WalletConnect Project ID
- Clear browser cache
- Try different wallet
- Check network settings

### Transactions Failing

- Verify contract addresses
- Check connected to correct network
- Ensure sufficient ETH for gas
- Check console for errors

### Data Not Loading

- Verify contract deployed
- Check RPC endpoint
- Inspect browser console
- Try refreshing page

### Styling Issues

- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind config

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile Safari: ✅ iOS 14+
- Mobile Chrome: ✅ Latest

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast mode compatible
- Screen reader friendly
- Focus indicators

## Contributing

1. Follow TypeScript strict mode
2. Use functional components with hooks
3. Add proper types for all props
4. Test on mobile and desktop
5. Maintain consistent styling

## License

MIT
