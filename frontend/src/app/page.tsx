'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Swords, Trophy, Target, Zap } from 'lucide-react';
import CreateBattle from '@/components/battle/CreateBattle';
import BattleList from '@/components/battle/BattleList';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import PlayerProfile from '@/components/profile/PlayerProfile';
import TournamentList from '@/components/tournament/TournamentList';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'battles' | 'leaderboard' | 'profile' | 'tournaments'>('battles');

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8 text-cyber-neon" />
              <h1 className="text-2xl font-bold neon-text text-cyber-neon">
                PvP Battle Arena
              </h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-dark-border bg-gradient-to-b from-dark-card/50 to-transparent py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-4 neon-text text-cyber-neon">
              Rock • Paper • Scissors • Lizard • Spock
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Fast-paced PvP battles on Base Chain. Wager ETH, prove your skills, climb the leaderboard!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <Zap className="w-6 h-6 text-cyber-neon mb-2" />
                <div className="stat-label">Low Gas Fees</div>
                <div className="stat-value text-lg">Base Chain</div>
              </div>
              <div className="stat-card">
                <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="stat-label">Win Rate</div>
                <div className="stat-value text-lg">95%</div>
              </div>
              <div className="stat-card">
                <Target className="w-6 h-6 text-purple-400 mb-2" />
                <div className="stat-label">Treasury Fee</div>
                <div className="stat-value text-lg">5%</div>
              </div>
              <div className="stat-card">
                <Swords className="w-6 h-6 text-pink-400 mb-2" />
                <div className="stat-label">Fair Play</div>
                <div className="stat-value text-lg">Commit-Reveal</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      {isConnected ? (
        <section className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            <TabButton
              active={activeTab === 'battles'}
              onClick={() => setActiveTab('battles')}
              icon={<Swords className="w-5 h-5" />}
              label="Battles"
            />
            <TabButton
              active={activeTab === 'leaderboard'}
              onClick={() => setActiveTab('leaderboard')}
              icon={<Trophy className="w-5 h-5" />}
              label="Leaderboard"
            />
            <TabButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              icon={<Target className="w-5 h-5" />}
              label="Profile"
            />
            <TabButton
              active={activeTab === 'tournaments'}
              onClick={() => setActiveTab('tournaments')}
              icon={<Zap className="w-5 h-5" />}
              label="Tournaments"
            />
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'battles' && (
              <div className="space-y-8">
                <CreateBattle />
                <BattleList />
              </div>
            )}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'profile' && address && <PlayerProfile address={address} />}
            {activeTab === 'tournaments' && <TournamentList />}
          </motion.div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Swords className="w-20 h-20 text-cyber-neon mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-8">
              Connect your wallet to start battling, earn achievements, and climb the leaderboard!
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-dark-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Built on Base Chain • Powered by Rock-Paper-Scissors-Lizard-Spock</p>
          <p className="text-sm mt-2">Fair play guaranteed with commit-reveal pattern</p>
        </div>
      </footer>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        active
          ? 'bg-cyber-neon text-dark-bg'
          : 'bg-dark-card text-gray-400 hover:text-white hover:border-cyber-neon/50 border border-dark-border'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
