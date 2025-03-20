import { create } from 'zustand';
import { GameState } from '../types/game';

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  setCurrentGame: (game) => set({ currentGame: game }),
}));