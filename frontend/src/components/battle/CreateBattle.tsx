'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { Move, MOVE_NAMES, MOVE_EMOJI, MOVE_DESCRIPTIONS } from '@/types';
import { generateCommitHash, generateRandomSalt, isValidWager, parseWager } from '@/utils/helpers';
import { useGameContract } from '@/hooks/useGameContract';
import { useBattleStore } from '@/store/battleStore';
import MoveSelector from './MoveSelector';

export default function CreateBattle() {
  const { address } = useAccount();
  const { createBattle } = useGameContract();
  const { selectedMove, setSelectedMove, setCurrentSalt, isCreatingBattle, setCreatingBattle } = useBattleStore();

  const [wager, setWager] = useState('0.01');
  const [referrer, setReferrer] = useState('');

  const handleCreateBattle = async () => {
    if (!address || !selectedMove) {
      toast.error('Please select a move');
      return;
    }

    const wagerBigInt = parseWager(wager);
    if (!isValidWager(wagerBigInt)) {
      toast.error('Wager must be between 0.001 and 10 ETH');
      return;
    }

    setCreatingBattle(true);

    try {
      const salt = generateRandomSalt();
      const commitHash = generateCommitHash(selectedMove, salt, address);

      setCurrentSalt(salt);

      const hash = await createBattle(
        wager,
        commitHash,
        referrer as `0x${string}` || undefined
      );

      toast.success('Battle created! Waiting for opponent...');

      // Store salt in localStorage for later reveal
      localStorage.setItem(`battle_salt_${hash}`, salt);
      localStorage.setItem(`battle_move_${hash}`, selectedMove.toString());

      setSelectedMove(null);
      setWager('0.01');
    } catch (error: any) {
      console.error('Create battle error:', error);
      toast.error(error.message || 'Failed to create battle');
    } finally {
      setCreatingBattle(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Swords className="w-6 h-6 text-cyber-neon" />
        <h2 className="text-2xl font-bold">Create New Battle</h2>
      </div>

      <div className="space-y-6">
        {/* Wager Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">
            Wager Amount (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            max="10"
            value={wager}
            onChange={(e) => setWager(e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:border-cyber-neon focus:outline-none text-white"
            placeholder="0.01"
          />
          <p className="text-xs text-gray-500 mt-1">
            Min: 0.001 ETH • Max: 10 ETH
          </p>
        </div>

        {/* Move Selection */}
        <div>
          <label className="block text-sm font-medium mb-4 text-gray-400">
            Choose Your Move
          </label>
          <MoveSelector
            selectedMove={selectedMove}
            onSelectMove={setSelectedMove}
          />
        </div>

        {/* Referrer (Optional) */}
        <details className="cursor-pointer">
          <summary className="text-sm text-gray-400 hover:text-white">
            Advanced Options
          </summary>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-400">
              Referrer Address (Optional)
            </label>
            <input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:border-cyber-neon focus:outline-none text-white"
              placeholder="0x..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Referrers earn 2% commission on fees
            </p>
          </div>
        </details>

        {/* Create Button */}
        <button
          onClick={handleCreateBattle}
          disabled={!selectedMove || isCreatingBattle}
          className="cyber-button w-full flex items-center justify-center gap-2"
        >
          {isCreatingBattle ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Battle...
            </>
          ) : (
            <>
              <Swords className="w-5 h-5" />
              Create Battle ({wager} ETH)
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-cyber-neon/5 border border-cyber-neon/20 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-cyber-neon">How it works:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Select your move and create a battle</li>
          <li>• Your move is hidden using commit-reveal</li>
          <li>• Wait for an opponent to join</li>
          <li>• Both players reveal their moves</li>
          <li>• Winner takes 95% of the pot!</li>
        </ul>
      </div>
    </motion.div>
  );
}
