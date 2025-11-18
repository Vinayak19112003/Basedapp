'use client';

import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, Coins } from 'lucide-react';

export default function TournamentList() {
  // Placeholder for tournaments
  const tournaments = [
    {
      id: 1,
      name: 'Daily Free Tournament',
      entryFee: '0 ETH',
      prizePool: '1 ETH',
      participants: 24,
      startTime: 'Today 18:00 UTC',
      status: 'Open',
    },
    {
      id: 2,
      name: 'Weekly Championship',
      entryFee: '0.1 ETH',
      prizePool: '5 ETH',
      participants: 64,
      startTime: 'Saturday 12:00 UTC',
      status: 'Open',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="cyber-card">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold">Tournaments</h2>
        </div>

        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-cyber-neon/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    {tournament.status}
                  </span>
                </div>
                <button className="cyber-button">
                  Join Tournament
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-cyber-neon" />
                  <div>
                    <div className="text-gray-400">Entry Fee</div>
                    <div className="text-white font-semibold">{tournament.entryFee}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-gray-400">Prize Pool</div>
                    <div className="text-white font-semibold">{tournament.prizePool}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-gray-400">Participants</div>
                    <div className="text-white font-semibold">{tournament.participants}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-gray-400">Start Time</div>
                    <div className="text-white font-semibold">{tournament.startTime}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cyber-card">
        <h3 className="text-xl font-bold mb-4">How Tournaments Work</h3>
        <ul className="space-y-2 text-gray-400">
          <li>• Daily free tournaments run every day at 18:00 UTC</li>
          <li>• Weekly championships offer bigger prizes for entry fee</li>
          <li>• Swiss or elimination format depending on participants</li>
          <li>• Top 3 players share the prize pool (50%, 30%, 20%)</li>
          <li>• Tournament scores based on wins and ELO</li>
        </ul>
      </div>
    </motion.div>
  );
}
