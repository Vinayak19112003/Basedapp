import { create } from 'zustand';
import { Move } from '@/types';

interface BattleState {
  selectedMove: Move | null;
  currentSalt: string | null;
  isCreatingBattle: boolean;
  isJoiningBattle: boolean;
  isRevealing: boolean;
  soundEnabled: boolean;

  setSelectedMove: (move: Move | null) => void;
  setCurrentSalt: (salt: string | null) => void;
  setCreatingBattle: (creating: boolean) => void;
  setJoiningBattle: (joining: boolean) => void;
  setRevealing: (revealing: boolean) => void;
  toggleSound: () => void;
  reset: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
  selectedMove: null,
  currentSalt: null,
  isCreatingBattle: false,
  isJoiningBattle: false,
  isRevealing: false,
  soundEnabled: true,

  setSelectedMove: (move) => set({ selectedMove: move }),
  setCurrentSalt: (salt) => set({ currentSalt: salt }),
  setCreatingBattle: (creating) => set({ isCreatingBattle: creating }),
  setJoiningBattle: (joining) => set({ isJoiningBattle: joining }),
  setRevealing: (revealing) => set({ isRevealing: revealing }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  reset: () => set({
    selectedMove: null,
    currentSalt: null,
    isCreatingBattle: false,
    isJoiningBattle: false,
    isRevealing: false,
  }),
}));
