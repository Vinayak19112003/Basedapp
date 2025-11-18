'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Coins } from 'lucide-react';
import { useBattleCounter } from '@/hooks/useGameContract';
import BattleCard from './BattleCard';

export default function BattleList() {
  const { data: battleCount } = useBattleCounter();
  const [battles, setBattles] = useState<bigint[]>([]);

  useEffect(() => {
    if (battleCount) {
      // Get last 10 battles
      const count = Number(battleCount);
      const battleIds: bigint[] = [];
      for (let i = Math.max(1, count - 9); i <= count; i++) {
        battleIds.push(BigInt(i));
      }
      setBattles(battleIds.reverse());
    }
  }, [battleCount]);

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-cyber-neon" />
          <h2 className="text-2xl font-bold">Active Battles</h2>
        </div>
        <div className="text-sm text-gray-400">
          Total: {battleCount?.toString() || '0'}
        </div>
      </div>

      {battles.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No battles yet. Create the first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {battles.map((battleId) => (
            <BattleCard key={battleId.toString()} battleId={battleId} />
          ))}
        </div>
      )}
    </div>
  );
}
