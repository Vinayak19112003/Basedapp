'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Trophy, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { useGetBattle, useGameContract } from '@/hooks/useGameContract';
import { BattleStatus, Move } from '@/types';
import { formatAddress, formatWager, generateCommitHash, generateRandomSalt } from '@/utils/helpers';
import { useBattleStore } from '@/store/battleStore';
import MoveSelector from './MoveSelector';

interface BattleCardProps {
  battleId: bigint;
}

export default function BattleCard({ battleId }: BattleCardProps) {
  const { address } = useAccount();
  const { data: battleData, refetch } = useGetBattle(battleId);
  const { joinBattle, revealMove } = useGameContract();
  const { selectedMove, setSelectedMove, isJoiningBattle, setJoiningBattle, isRevealing, setRevealing } = useBattleStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);

  if (!battleData) return null;

  const battle = {
    id: battleId,
    player1: battleData[0] as `0x${string}`,
    player2: battleData[1] as `0x${string}`,
    wager: battleData[2] as bigint,
    status: battleData[8] as BattleStatus,
    winner: battleData[9] as `0x${string}`,
    player1Revealed: battleData[5] as boolean,
    player2Revealed: battleData[6] as boolean,
  };

  const isPlayer = address === battle.player1 || address === battle.player2;
  const isPlayer1 = address === battle.player1;
  const canJoin = battle.status === BattleStatus.Created && !isPlayer;
  const canReveal = battle.status === BattleStatus.Active && isPlayer &&
    ((isPlayer1 && !battle.player1Revealed) || (!isPlayer1 && !battle.player2Revealed));

  const handleJoin = async () => {
    if (!address || !selectedMove) {
      toast.error('Please select a move');
      return;
    }

    setJoiningBattle(true);

    try {
      const salt = generateRandomSalt();
      const commitHash = generateCommitHash(selectedMove, salt, address);

      const hash = await joinBattle(battleId, commitHash, battle.wager);

      toast.success('Joined battle!');

      // Store salt for later reveal
      localStorage.setItem(`battle_salt_${battleId}`, salt);
      localStorage.setItem(`battle_move_${battleId}`, selectedMove.toString());

      setShowJoinModal(false);
      setSelectedMove(null);
      refetch();
    } catch (error: any) {
      console.error('Join battle error:', error);
      toast.error(error.message || 'Failed to join battle');
    } finally {
      setJoiningBattle(false);
    }
  };

  const handleReveal = async () => {
    if (!address) return;

    setRevealing(true);

    try {
      const salt = localStorage.getItem(`battle_salt_${battleId}`);
      const move = localStorage.getItem(`battle_move_${battleId}`);

      if (!salt || !move) {
        toast.error('Move data not found. Please contact support.');
        return;
      }

      await revealMove(battleId, parseInt(move) as Move, salt);

      toast.success('Move revealed!');
      setShowRevealModal(false);
      refetch();
    } catch (error: any) {
      console.error('Reveal move error:', error);
      toast.error(error.message || 'Failed to reveal move');
    } finally {
      setRevealing(false);
    }
  };

  const getStatusBadge = () => {
    switch (battle.status) {
      case BattleStatus.Created:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Waiting</span>;
      case BattleStatus.Active:
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Active</span>;
      case BattleStatus.Completed:
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Completed</span>;
      case BattleStatus.Cancelled:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-cyber-neon/50 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">Battle #{battleId.toString()}</span>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Player 1:</span>
                <span className="text-white font-mono">{formatAddress(battle.player1)}</span>
                {battle.player1Revealed && <span className="text-green-400">✓</span>}
              </div>

              {battle.player2 !== '0x0000000000000000000000000000000000000000' && (
                <>
                  <span className="text-gray-600">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Player 2:</span>
                    <span className="text-white font-mono">{formatAddress(battle.player2)}</span>
                    {battle.player2Revealed && <span className="text-green-400">✓</span>}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2 text-cyber-neon">
                <Swords className="w-4 h-4" />
                <span>{formatWager(battle.wager)} ETH</span>
              </div>

              {battle.status === BattleStatus.Completed && battle.winner !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Trophy className="w-4 h-4" />
                  <span>Winner: {formatAddress(battle.winner)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {canJoin && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="cyber-button-secondary px-4 py-2 text-sm"
              >
                Join Battle
              </button>
            )}

            {canReveal && (
              <button
                onClick={() => setShowRevealModal(true)}
                className="cyber-button px-4 py-2 text-sm animate-pulse"
              >
                Reveal Move
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card max-w-2xl w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Join Battle #{battleId.toString()}</h3>
            <p className="text-gray-400 mb-4">Wager: {formatWager(battle.wager)} ETH</p>

            <MoveSelector selectedMove={selectedMove} onSelectMove={setSelectedMove} />

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="cyber-button-secondary flex-1"
                disabled={isJoiningBattle}
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={!selectedMove || isJoiningBattle}
                className="cyber-button flex-1 flex items-center justify-center gap-2"
              >
                {isJoiningBattle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>Join Battle</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reveal Modal */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Reveal Your Move</h3>
            <p className="text-gray-400 mb-6">
              Both players must reveal their moves. Click below to reveal your committed move.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowRevealModal(false)}
                className="cyber-button-secondary flex-1"
                disabled={isRevealing}
              >
                Cancel
              </button>
              <button
                onClick={handleReveal}
                disabled={isRevealing}
                className="cyber-button flex-1 flex items-center justify-center gap-2"
              >
                {isRevealing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Revealing...
                  </>
                ) : (
                  <>Reveal Move</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
