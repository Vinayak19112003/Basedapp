'use client';

import { motion } from 'framer-motion';
import { User, Trophy, Target, TrendingUp, Award, Flame } from 'lucide-react';
import { Address } from 'viem';
import { useGetPlayerStats, useGetVIPTier } from '@/hooks/useGameContract';
import { formatNumber, calculateWinRate, getVIPTierName, getVIPTierColor } from '@/utils/helpers';

interface PlayerProfileProps {
  address: Address;
}

export default function PlayerProfile({ address }: PlayerProfileProps) {
  const { data: stats } = useGetPlayerStats(address);
  const { data: vipTier } = useGetVIPTier(address);

  if (!stats) {
    return (
      <div className="cyber-card">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const playerStats = {
    wins: stats[0] as bigint,
    losses: stats[1] as bigint,
    draws: stats[2] as bigint,
    totalBattles: stats[3] as bigint,
    eloRating: stats[4] as bigint,
    totalWagered: stats[5] as bigint,
    totalWon: stats[6] as bigint,
    currentStreak: stats[7] as bigint,
    bestStreak: stats[8] as bigint,
  };

  const winRate = calculateWinRate(playerStats.wins, playerStats.totalBattles);
  const tier = Number(vipTier || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="cyber-card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-cyber-500 to-cyber-700 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Your Profile</h2>
            <p className="text-sm text-gray-400 font-mono">{address}</p>
            <div className={`text-sm ${getVIPTierColor(tier)} font-semibold mt-1`}>
              {getVIPTierName(tier)} Tier
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-6 h-6 text-yellow-400" />}
          label="ELO Rating"
          value={formatNumber(playerStats.eloRating)}
          highlight
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-green-400" />}
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
        />
        <StatCard
          icon={<Flame className="w-6 h-6 text-orange-400" />}
          label="Current Streak"
          value={formatNumber(playerStats.currentStreak)}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-blue-400" />}
          label="Best Streak"
          value={formatNumber(playerStats.bestStreak)}
        />
      </div>

      {/* Detailed Stats */}
      <div className="cyber-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-cyber-neon" />
          Battle Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-dark-bg rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Battles</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(playerStats.totalBattles)}
            </div>
          </div>

          <div className="p-4 bg-dark-bg rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Wins</div>
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(playerStats.wins)}
            </div>
          </div>

          <div className="p-4 bg-dark-bg rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Losses</div>
            <div className="text-2xl font-bold text-red-400">
              {formatNumber(playerStats.losses)}
            </div>
          </div>

          <div className="p-4 bg-dark-bg rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Draws</div>
            <div className="text-2xl font-bold text-gray-400">
              {formatNumber(playerStats.draws)}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Placeholder */}
      <div className="cyber-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-cyber-neon" />
          Achievements
        </h3>
        <p className="text-gray-400 text-center py-8">
          Achievement NFTs will appear here
        </p>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card ${highlight ? 'border-cyber-neon/50' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
      </div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${highlight ? 'text-cyber-neon' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
