'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import { useGetLeaderboard } from '@/hooks/useGameContract';
import { formatAddress, calculateWinRate } from '@/utils/helpers';

export default function Leaderboard() {
  const { data: leaderboardData } = useGetLeaderboard(100);

  const players = leaderboardData?.[0] || [];
  const elos = leaderboardData?.[1] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold">Global Leaderboard</h2>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No players yet. Be the first!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border text-left">
                <th className="p-4 text-gray-400 font-semibold">Rank</th>
                <th className="p-4 text-gray-400 font-semibold">Player</th>
                <th className="p-4 text-gray-400 font-semibold">ELO</th>
                <th className="p-4 text-gray-400 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <motion.tr
                  key={player}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="leaderboard-row"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <span className="text-white font-semibold">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-white">{formatAddress(player)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-cyber-neon font-bold text-lg">
                      {elos[index]?.toString() || '0'}
                    </span>
                  </td>
                  <td className="p-4">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
