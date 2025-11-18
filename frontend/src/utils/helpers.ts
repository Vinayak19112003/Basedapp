import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther, parseEther, keccak256, encodePacked } from 'viem';
import { Move } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWager(wager: bigint): string {
  return parseFloat(formatEther(wager)).toFixed(4);
}

export function formatNumber(num: bigint | number): string {
  const value = typeof num === 'bigint' ? Number(num) : num;
  return new Intl.NumberFormat('en-US').format(value);
}

export function calculateWinRate(wins: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return (Number(wins) / Number(total)) * 100;
}

export function generateCommitHash(
  move: Move,
  salt: string,
  playerAddress: string
): `0x${string}` {
  const saltBytes = encodePacked(['string'], [salt]);
  return keccak256(
    encodePacked(
      ['uint8', 'bytes32', 'address'],
      [move, saltBytes as `0x${string}`, playerAddress as `0x${string}`]
    )
  );
}

export function generateRandomSalt(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export function getTimeRemaining(deadline: bigint): {
  total: number;
  minutes: number;
  seconds: number;
} {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = deadline > now ? Number(deadline - now) : 0;

  return {
    total: remaining,
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
  };
}

export function getRarityColor(rarity: bigint): string {
  switch (Number(rarity)) {
    case 1:
      return 'text-gray-400';
    case 2:
      return 'text-blue-400';
    case 3:
      return 'text-purple-400';
    case 4:
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export function getRarityName(rarity: bigint): string {
  switch (Number(rarity)) {
    case 1:
      return 'Common';
    case 2:
      return 'Rare';
    case 3:
      return 'Epic';
    case 4:
      return 'Legendary';
    default:
      return 'Unknown';
  }
}

export function getVIPTierName(tier: number): string {
  switch (tier) {
    case 0:
      return 'Standard';
    case 1:
      return 'Bronze';
    case 2:
      return 'Silver';
    case 3:
      return 'Gold';
    default:
      return 'Standard';
  }
}

export function getVIPTierColor(tier: number): string {
  switch (tier) {
    case 0:
      return 'text-gray-400';
    case 1:
      return 'text-orange-400';
    case 2:
      return 'text-gray-300';
    case 3:
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export function parseWager(wagerStr: string): bigint {
  try {
    return parseEther(wagerStr);
  } catch {
    return 0n;
  }
}

export function isValidWager(wager: bigint): boolean {
  const MIN_WAGER = parseEther('0.001');
  const MAX_WAGER = parseEther('10');
  return wager >= MIN_WAGER && wager <= MAX_WAGER;
}
