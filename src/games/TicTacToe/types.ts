export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type GameStatus = 'playing' | 'won' | 'draw';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type GameMode = 'pvp' | 'ai';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: number[] | null;
  gameMode: GameMode;
  difficulty: Difficulty;
}