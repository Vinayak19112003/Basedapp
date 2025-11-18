import { Address } from 'viem';

export enum BattleStatus {
  Created = 0,
  Active = 1,
  Revealing = 2,
  Completed = 3,
  Cancelled = 4,
  Expired = 5,
}

export enum TournamentStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
}

export enum TournamentType {
  Daily = 0,
  Weekly = 1,
  Special = 2,
}

export enum Move {
  None = 0,
  Rock = 1,
  Paper = 2,
  Scissors = 3,
  Lizard = 4,
  Spock = 5,
}

export interface Battle {
  id: bigint;
  player1: Address;
  player2: Address;
  wager: bigint;
  tokenAddress: Address;
  player1CommitHash: `0x${string}`;
  player2CommitHash: `0x${string}`;
  player1Move: Move;
  player2Move: Move;
  player1Revealed: boolean;
  player2Revealed: boolean;
  createdAt: bigint;
  revealDeadline: bigint;
  status: BattleStatus;
  winner: Address;
}

export interface PlayerStats {
  wins: bigint;
  losses: bigint;
  draws: bigint;
  totalBattles: bigint;
  eloRating: bigint;
  totalWagered: bigint;
  totalWon: bigint;
  currentStreak: bigint;
  bestStreak: bigint;
  lastBattleTime: bigint;
}

export interface Tournament {
  id: bigint;
  name: string;
  entryFee: bigint;
  prizePool: bigint;
  startTime: bigint;
  endTime: bigint;
  participants: Address[];
  status: TournamentStatus;
  tournamentType: TournamentType;
}

export interface Achievement {
  id: bigint;
  name: string;
  description: string;
  imageURI: string;
  rarity: bigint;
}

export interface LeaderboardEntry {
  address: Address;
  elo: bigint;
  wins: bigint;
  losses: bigint;
  winRate: number;
}

export const MOVE_NAMES: Record<Move, string> = {
  [Move.None]: 'None',
  [Move.Rock]: 'Rock',
  [Move.Paper]: 'Paper',
  [Move.Scissors]: 'Scissors',
  [Move.Lizard]: 'Lizard',
  [Move.Spock]: 'Spock',
};

export const MOVE_EMOJI: Record<Move, string> = {
  [Move.None]: '❓',
  [Move.Rock]: '🪨',
  [Move.Paper]: '📄',
  [Move.Scissors]: '✂️',
  [Move.Lizard]: '🦎',
  [Move.Spock]: '🖖',
};

export const MOVE_DESCRIPTIONS: Record<Move, string> = {
  [Move.None]: '',
  [Move.Rock]: 'Crushes Scissors and Lizard',
  [Move.Paper]: 'Covers Rock and disproves Spock',
  [Move.Scissors]: 'Cuts Paper and decapitates Lizard',
  [Move.Lizard]: 'Eats Paper and poisons Spock',
  [Move.Spock]: 'Smashes Scissors and vaporizes Rock',
};
