import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Pause, Play, RefreshCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Direction, Point, GameState, Difficulty, Food, Wall, FoodType, SnakeColor, SPEEDS, FOOD_POINTS, FOOD_EMOJIS, SNAKE_COLORS } from './types';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }];
const WALL_SPAWN_SCORE = 10;
const MULTI_FOOD_SCORE = 5;
const SWIPE_THRESHOLD = 50;

interface TouchPosition {
  x: number;
  y: number;
}

const getRandomPosition = (snake: Point[], foods: Food[], walls: Wall[]): Point => {
  let position: Point;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (
    snake.some(segment => segment.x === position.x && segment.y === position.y) ||
    foods.some(food => food.x === position.x && food.y === position.y) ||
    walls.some(wall => wall.x === position.x && wall.y === position.y)
  );
  return position;
};

const getRandomFoodType = (): FoodType => {
  const types: FoodType[] = ['apple', 'banana', 'meat', 'berry'];
  const weights = [0.4, 0.3, 0.2, 0.1];
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) return types[i];
  }
  return 'apple';
};

const createFood = (snake: Point[], foods: Food[], walls: Wall[]): Food => {
  const position = getRandomPosition(snake, foods, walls);
  const type = getRandomFoodType();
  return {
    ...position,
    type,
    points: FOOD_POINTS[type]
  };
};

const createWall = (snake: Point[], foods: Food[], walls: Wall[]): Wall => {
  return getRandomPosition(snake, foods, walls);
};

const createBorderWalls = (): Wall[] => {
  const walls: Wall[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    walls.push({ x: i, y: 0 }); // Top wall
    walls.push({ x: i, y: GRID_SIZE - 1 }); // Bottom wall
    walls.push({ x: 0, y: i }); // Left wall
    walls.push({ x: GRID_SIZE - 1, y: i }); // Right wall
  }
  return walls;
};

const initialState: GameState = {
  snake: INITIAL_SNAKE,
  foods: [createFood(INITIAL_SNAKE, [], [])],
  walls: [],
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  difficulty: 'normal',
  gridSize: GRID_SIZE,
  snakeColor: 'green'
};

const Snake: React.FC = () => {
  const [state, setState] = useState<GameState>(initialState);
  const [showControls, setShowControls] = useState(window.innerWidth <= 768);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const moveSnake = useCallback(() => {
    const newSnake = [...state.snake];
    const head = { ...newSnake[0] };

    switch (state.nextDirection) {
      case 'UP':
        head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case 'DOWN':
        head.y = (head.y + 1) % GRID_SIZE;
        break;
      case 'LEFT':
        head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case 'RIGHT':
        head.x = (head.x + 1) % GRID_SIZE;
        break;
    }

    // In extreme mode, hitting the border walls counts as collision
    if (state.difficulty === 'extreme' && (head.x === 0 || head.x === GRID_SIZE - 1 || head.y === 0 || head.y === GRID_SIZE - 1)) {
      setState(prev => ({ ...prev, isGameOver: true }));
      return;
    }

    if (
      newSnake.some(segment => segment.x === head.x && segment.y === head.y) ||
      state.walls.some(wall => wall.x === head.x && wall.y === head.y)
    ) {
      setState(prev => ({ ...prev, isGameOver: true }));
      return;
    }

    newSnake.unshift(head);

    const foodIndex = state.foods.findIndex(food => food.x === head.x && food.y === head.y);
    if (foodIndex !== -1) {
      const eatenFood = state.foods[foodIndex];
      const newFoods = state.foods.filter((_, i) => i !== foodIndex);
      const newScore = state.score + eatenFood.points;
      
      if (newScore >= MULTI_FOOD_SCORE) {
        const foodCount = Math.min(3, Math.floor(newScore / MULTI_FOOD_SCORE));
        for (let i = newFoods.length; i < foodCount; i++) {
          newFoods.push(createFood(newSnake, newFoods, state.walls));
        }
      } else {
        newFoods.push(createFood(newSnake, newFoods, state.walls));
      }

      const newWalls = [...state.walls];
      if (state.difficulty !== 'extreme' && newScore >= WALL_SPAWN_SCORE && newScore % WALL_SPAWN_SCORE === 0) {
        newWalls.push(createWall(newSnake, newFoods, newWalls));
      }

      setState(prev => ({
        ...prev,
        foods: newFoods,
        walls: newWalls,
        score: newScore,
        highScore: Math.max(newScore, prev.highScore)
      }));
    } else {
      newSnake.pop();
    }

    setState(prev => ({
      ...prev,
      snake: newSnake,
      direction: prev.nextDirection
    }));
  }, [state.nextDirection, state.foods, state.walls, state.snake, state.difficulty]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.isGameOver) return;

    const keyDirections: { [key: string]: Direction } = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT'
    };

    const newDirection = keyDirections[e.key];
    if (!newDirection) return;

    const opposites: { [key in Direction]: Direction } = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposites[newDirection] !== state.direction) {
      setState(prev => ({ ...prev, nextDirection: newDirection }));
    }
  }, [state.direction, state.isGameOver]);

  const handleDirectionClick = (direction: Direction) => {
    if (state.isGameOver) return;

    const opposites: { [key in Direction]: Direction } = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposites[direction] !== state.direction) {
      setState(prev => ({ ...prev, nextDirection: direction }));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) > SWIPE_THRESHOLD) {
      if (absDeltaX > absDeltaY) {
        handleDirectionClick(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirectionClick(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }

    setTouchStart(null);
  };

  const togglePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const resetGame = () => {
    const newState = {
      ...initialState,
      highScore: state.highScore,
      difficulty: state.difficulty,
      snakeColor: state.snakeColor,
      walls: state.difficulty === 'extreme' ? createBorderWalls() : []
    };
    setState(newState);
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setState(prev => ({
      ...initialState,
      difficulty,
      highScore: prev.highScore,
      snakeColor: prev.snakeColor,
      walls: difficulty === 'extreme' ? createBorderWalls() : []
    }));
  };

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb';
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }

    state.foods.forEach(food => {
      ctx.font = `${cellSize * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        FOOD_EMOJIS[food.type],
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2
      );
    });

    state.walls.forEach(wall => {
      ctx.fillStyle = isDark ? '#4b5563' : '#6b7280';
      ctx.fillRect(
        wall.x * cellSize,
        wall.y * cellSize,
        cellSize,
        cellSize
      );
    });

    state.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const [primaryColor, secondaryColor] = isDark 
        ? SNAKE_COLORS[state.snakeColor].dark 
        : SNAKE_COLORS[state.snakeColor].light;
      
      const gradient = ctx.createLinearGradient(
        segment.x * cellSize,
        segment.y * cellSize,
        (segment.x + 1) * cellSize,
        (segment.y + 1) * cellSize
      );
      
      gradient.addColorStop(0, isHead ? primaryColor : secondaryColor);
      gradient.addColorStop(1, secondaryColor);

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.roundRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
        isHead ? cellSize / 4 : cellSize / 6
      );
      ctx.fill();

      if (isHead) {
        ctx.fillStyle = '#000000';
        const eyeSize = cellSize / 6;
        const eyeOffset = cellSize / 4;
        
        switch (state.direction) {
          case 'RIGHT':
            ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
          case 'LEFT':
            ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * cellSize + eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
          case 'UP':
            ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
          case 'DOWN':
            ctx.fillRect(segment.x * cellSize + eyeOffset, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * cellSize + cellSize - eyeOffset - eyeSize, segment.y * cellSize + cellSize - eyeOffset, eyeSize, eyeSize);
            break;
        }
      }
    });
  }, [state.snake, state.foods, state.walls, state.direction, state.snakeColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const size = Math.min(
        window.innerWidth - 32,
        window.innerHeight - 300
      );
      canvas.width = size;
      canvas.height = size;
      drawGame();
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [drawGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (state.isGameOver || state.isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime = 0;
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > SPEEDS[state.difficulty]) {
        moveSnake();
        drawGame();
        lastTime = timestamp;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [state.isGameOver, state.isPaused, state.difficulty, moveSnake, drawGame]);

  useEffect(() => {
    const handleResize = () => {
      setShowControls(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-4">
          {(['easy', 'normal', 'hard', 'extreme'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors
                ${state.difficulty === diff
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold dark:text-white">
            Score: {state.score}
          </div>
          <div className="text-lg font-semibold text-yellow-500">
            High Score: {state.highScore}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Palette size={24} className="dark:text-white" />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 grid grid-cols-5 gap-2">
                {(Object.keys(SNAKE_COLORS) as SnakeColor[]).map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setState(prev => ({ ...prev, snakeColor: color }));
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      state.snakeColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${SNAKE_COLORS[color].light[0]}, ${SNAKE_COLORS[color].light[1]})`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={togglePause}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {state.isPaused ? <Play size={24} className="dark:text-white" /> : <Pause size={24} className="dark:text-white" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw size={24} className="dark:text-white" />
          </button>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-lg"
        />

        <AnimatePresence>
          {state.isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg"
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Game Over!</h2>
                <p className="text-lg mb-4 dark:text-gray-300">Score: {state.score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showControls && (
        <div className="mt-8 grid grid-cols-3 gap-4 w-48">
          <div />
          <button
            onTouchStart={() => handleDirectionClick('UP')}
            onMouseDown={() => handleDirectionClick('UP')}
            className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg active:bg-gray-300 dark:active:bg-gray-600 transition-colors active:scale-95 touch-none"
          >
            <ChevronUp size={24} className="dark:text-white" />
          </button>
          <div />
          <button
            onTouchStart={() => handleDirectionClick('LEFT')}
            onMouseDown={() => handleDirectionClick('LEFT')}
            className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg active:bg-gray-300 dark:active:bg-gray-600 transition-colors active:scale-95 touch-none"
          >
            <ChevronLeft size={24} className="dark:text-white" />
          </button>
          <button
            onTouchStart={() => handleDirectionClick('DOWN')}
            onMouseDown={() => handleDirectionClick('DOWN')}
            className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg active:bg-gray-300 dark:active:bg-gray-600 transition-colors active:scale-95 touch-none"
          >
            <ChevronDown size={24} className="dark:text-white" />
          </button>
          <button
            onTouchStart={() => handleDirectionClick('RIGHT')}
            onMouseDown={() => handleDirectionClick('RIGHT')}
            className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg active:bg-gray-300 dark:active:bg-gray-600 transition-colors active:scale-95 touch-none"
          >
            <ChevronRight size={24} className="dark:text-white" />
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Use arrow keys, WASD, swipe, or control buttons to move the snake</p>
        <p>Collect different foods to grow and increase your score:</p>
        <div className="flex justify-center gap-4 mt-2">
          <span>{FOOD_EMOJIS.apple} Apple: +1 point</span>
          <span>{FOOD_EMOJIS.banana} Banana: +2 points</span>
          <span>{FOOD_EMOJIS.meat} Meat: +3 points</span>
          <span>{FOOD_EMOJIS.berry} Berry: +1 point</span>
        </div>
        <p className="mt-2">
          {state.difficulty === 'extreme' 
            ? "Extreme mode: Don't hit the walls around the board!"
            : `Watch out for walls that appear after score ${WALL_SPAWN_SCORE}!`}
        </p>
      </div>
    </div>
  );
};

export default Snake;