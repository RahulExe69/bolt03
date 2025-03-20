export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  highScore: number;
  isPlaying: boolean;
  isGameOver: boolean;
  difficulty: Difficulty;
}

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 640;
export const BIRD_WIDTH = 34;
export const BIRD_HEIGHT = 24;
export const PIPE_WIDTH = 52;
export const PIPE_GAP = 160;
export const GRAVITY = 0.4;
export const FLAP_STRENGTH = -7;
export const PIPE_SPEED = 2;

export const DIFFICULTY_SETTINGS = {
  easy: {
    pipeGap: PIPE_GAP + 40,
    pipeInterval: 180,
    gravity: GRAVITY * 0.8
  },
  normal: {
    pipeGap: PIPE_GAP,
    pipeInterval: 150,
    gravity: GRAVITY
  },
  hard: {
    pipeGap: PIPE_GAP - 20,
    pipeInterval: 120,
    gravity: GRAVITY * 1.2
  }
};