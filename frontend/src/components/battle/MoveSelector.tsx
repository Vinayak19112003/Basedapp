'use client';

import { motion } from 'framer-motion';
import { Move, MOVE_NAMES, MOVE_EMOJI, MOVE_DESCRIPTIONS } from '@/types';

const MOVES = [Move.Rock, Move.Paper, Move.Scissors, Move.Lizard, Move.Spock];

interface MoveSelectorProps {
  selectedMove: Move | null;
  onSelectMove: (move: Move) => void;
  disabled?: boolean;
}

export default function MoveSelector({ selectedMove, onSelectMove, disabled }: MoveSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {MOVES.map((move) => (
        <motion.button
          key={move}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && onSelectMove(move)}
          disabled={disabled}
          className={`battle-move-card ${selectedMove === move ? 'selected' : ''}`}
        >
          <span className="text-4xl">{MOVE_EMOJI[move]}</span>
          <span className="font-semibold text-white">{MOVE_NAMES[move]}</span>
          <span className="text-xs text-gray-400 text-center">
            {MOVE_DESCRIPTIONS[move]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
