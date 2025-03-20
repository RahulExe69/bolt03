export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';
export type FoodType = 'apple' | 'banana' | 'meat' | 'berry';
export type SnakeColor = 'green' | 'blue' | 'purple' | 'orange' | 'pink';

export interface Point {
  x: number;
  y: number;
}

export interface Food extends Point {
  type: FoodType;
  points: number;
}

export interface Wall extends Point {}

export interface GameState {
  snake: Point[];
  foods: Food[];
  walls: Wall[];
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  difficulty: Difficulty;
  gridSize: number;
  snakeColor: SnakeColor;
}

export const SPEEDS = {
  easy: 150,
  normal: 100,
  hard: 70,
  extreme: 70
};

export const FOOD_POINTS = {
  apple: 1,
  banana: 2,
  meat: 3,
  berry: 1
};

export const FOOD_EMOJIS = {
  apple: '🍎',
  banana: '🍌',
  meat: '🥩',
  berry: '🫐'
};

export const SNAKE_COLORS: Record<SnakeColor, { light: [string, string], dark: [string, string] }> = {
  green: {
    light: ['#10b981', '#059669'],
    dark: ['#34d399', '#059669']
  },
  blue: {
    light: ['#3b82f6', '#2563eb'],
    dark: ['#60a5fa', '#3b82f6']
  },
  purple: {
    light: ['#8b5cf6', '#6d28d9'],
    dark: ['#a78bfa', '#7c3aed']
  },
  orange: {
    light: ['#f97316', '#ea580c'],
    dark: ['#fb923c', '#f97316']
  },
  pink: {
    light: ['#ec4899', '#db2777'],
    dark: ['#f472b6', '#ec4899']
  }
};