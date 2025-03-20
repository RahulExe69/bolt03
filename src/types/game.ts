export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Game {
  id: number;
  name: string;
  description: string;
  icon: string;
  hasBot: boolean;
  maxPlayers: number;
}

export interface GameState {
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
}