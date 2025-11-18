import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther } from 'viem';
import { Move } from '@/types';
import GameABI from '@/contracts/PvPBattleGame.json';

const GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS as Address;

export function useGameContract() {
  const { writeContractAsync } = useWriteContract();

  const createBattle = async (
    wager: string,
    commitHash: `0x${string}`,
    referrer?: Address
  ) => {
    return await writeContractAsync({
      address: GAME_CONTRACT_ADDRESS,
      abi: GameABI,
      functionName: 'createBattle',
      args: [
        parseEther(wager),
        '0x0000000000000000000000000000000000000000', // ETH
        commitHash,
        referrer || '0x0000000000000000000000000000000000000000',
      ],
      value: parseEther(wager),
    });
  };

  const joinBattle = async (battleId: bigint, commitHash: `0x${string}`, wager: bigint) => {
    return await writeContractAsync({
      address: GAME_CONTRACT_ADDRESS,
      abi: GameABI,
      functionName: 'joinBattle',
      args: [battleId, commitHash],
      value: wager,
    });
  };

  const revealMove = async (battleId: bigint, move: Move, salt: string) => {
    const saltBytes = `0x${Buffer.from(salt).toString('hex').padEnd(64, '0')}` as `0x${string}`;
    return await writeContractAsync({
      address: GAME_CONTRACT_ADDRESS,
      abi: GameABI,
      functionName: 'revealMove',
      args: [battleId, move, saltBytes],
    });
  };

  const claimTimeout = async (battleId: bigint) => {
    return await writeContractAsync({
      address: GAME_CONTRACT_ADDRESS,
      abi: GameABI,
      functionName: 'claimTimeout',
      args: [battleId],
    });
  };

  const cancelBattle = async (battleId: bigint) => {
    return await writeContractAsync({
      address: GAME_CONTRACT_ADDRESS,
      abi: GameABI,
      functionName: 'cancelBattle',
      args: [battleId],
    });
  };

  return {
    createBattle,
    joinBattle,
    revealMove,
    claimTimeout,
    cancelBattle,
  };
}

export function useGetBattle(battleId: bigint) {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'getBattle',
    args: [battleId],
  });
}

export function useGetPlayerStats(address: Address) {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'getPlayerStats',
    args: [address],
  });
}

export function useGetLeaderboard(limit: number = 100) {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'getLeaderboard',
    args: [BigInt(limit)],
  });
}

export function useGetPlayerBattles(address: Address) {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'getPlayerBattles',
    args: [address],
  });
}

export function useGetVIPTier(address: Address) {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'getVIPTier',
    args: [address],
  });
}

export function useBattleCounter() {
  return useReadContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: GameABI,
    functionName: 'battleCounter',
  });
}
