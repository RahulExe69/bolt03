import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw } from 'lucide-react';
import {
  Bird, Pipe, GameState, Difficulty,
  CANVAS_WIDTH, CANVAS_HEIGHT, BIRD_WIDTH, BIRD_HEIGHT,
  PIPE_WIDTH, PIPE_GAP, FLAP_STRENGTH, PIPE_SPEED,
  DIFFICULTY_SETTINGS
} from './types';

const birdImage = new Image();
birdImage.src = 'https://raw.githubusercontent.com/sourabhv/FlapPyBird/master/assets/sprites/yellowbird-midflap.png';

const initialBird: Bird = {
  y: CANVAS_HEIGHT / 2,
  velocity: 0,
  rotation: 0
};

const createPipe = (): Pipe => ({
  x: CANVAS_WIDTH,
  topHeight: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
  passed: false
});

const initialState: GameState = {
  bird: initialBird,
  pipes: [],
  score: 0,
  highScore: 0,
  isPlaying: false,
  isGameOver: false,
  difficulty: 'normal'
};

const FlappyBird: React.FC = () => {
  const [state, setState] = useState<GameState>(initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const lastPipeRef = useRef<number>(0);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#65B6FF');
    gradient.addColorStop(1, '#A1D9FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const time = Date.now() * 0.001;
    for (let i = 0; i < 5; i++) {
      const x = ((time * 20 + i * 200) % (CANVAS_WIDTH + 100)) - 50;
      const y = 50 + i * 40;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
      ctx.arc(x + 15, y + 10, 15, 0, Math.PI * 2);
      ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird) => {
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 4, bird.y);
    ctx.rotate(bird.rotation);
    ctx.drawImage(
      birdImage,
      -BIRD_WIDTH / 2,
      -BIRD_HEIGHT / 2,
      BIRD_WIDTH,
      BIRD_HEIGHT
    );
    ctx.restore();
  }, []);

  const drawPipe = useCallback((ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    gradient.addColorStop(0, '#2ECC71');
    gradient.addColorStop(1, '#27AE60');

    // Top pipe
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    
    // Pipe cap
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, PIPE_WIDTH + 6, 20);

    // Bottom pipe
    ctx.fillStyle = gradient;
    const bottomPipeY = pipe.topHeight + DIFFICULTY_SETTINGS[state.difficulty].pipeGap;
    ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY);
    
    // Pipe cap
    ctx.fillRect(pipe.x - 3, bottomPipeY, PIPE_WIDTH + 6, 20);
  }, [state.difficulty]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw scene
    drawBackground(ctx);
    state.pipes.forEach(pipe => drawPipe(ctx, pipe));
    drawBird(ctx, state.bird);

    // Draw score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(state.score.toString(), CANVAS_WIDTH / 2, 80);
    ctx.fillText(state.score.toString(), CANVAS_WIDTH / 2, 80);
  }, [state, drawBackground, drawBird, drawPipe]);

  const update = useCallback(() => {
    if (!state.isPlaying || state.isGameOver) return;

    setState(prev => {
      const newState = { ...prev };
      const settings = DIFFICULTY_SETTINGS[state.difficulty];

      // Update bird
      newState.bird = {
        ...prev.bird,
        y: prev.bird.y + prev.bird.velocity,
        velocity: prev.bird.velocity + settings.gravity,
        rotation: Math.min(Math.PI / 2, Math.max(-Math.PI / 4, prev.bird.velocity * 0.1))
      };

      // Update pipes
      newState.pipes = prev.pipes
        .map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        }))
        .filter(pipe => pipe.x + PIPE_WIDTH > 0);

      // Add new pipes
      const time = Date.now();
      if (time - lastPipeRef.current > settings.pipeInterval) {
        newState.pipes.push(createPipe());
        lastPipeRef.current = time;
      }

      // Check collisions and scoring
      const birdBox = {
        left: CANVAS_WIDTH / 4 - BIRD_WIDTH / 2,
        right: CANVAS_WIDTH / 4 + BIRD_WIDTH / 2,
        top: newState.bird.y - BIRD_HEIGHT / 2,
        bottom: newState.bird.y + BIRD_HEIGHT / 2
      };

      // Ground and ceiling collision
      if (birdBox.bottom > CANVAS_HEIGHT || birdBox.top < 0) {
        return {
          ...newState,
          isGameOver: true,
          highScore: Math.max(prev.score, prev.highScore)
        };
      }

      // Pipe collisions and scoring
      for (const pipe of newState.pipes) {
        const pipeBox = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: 0,
          bottom: pipe.topHeight
        };

        const bottomPipeBox = {
          left: pipe.x,
          right: pipe.x + PIPE_WIDTH,
          top: pipe.topHeight + settings.pipeGap,
          bottom: CANVAS_HEIGHT
        };

        if (
          (birdBox.right > pipeBox.left && birdBox.left < pipeBox.right) &&
          (birdBox.top < pipeBox.bottom || birdBox.bottom > bottomPipeBox.top)
        ) {
          return {
            ...newState,
            isGameOver: true,
            highScore: Math.max(prev.score, prev.highScore)
          };
        }

        // Score point
        if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 4) {
          pipe.passed = true;
          newState.score += 1;
        }
      }

      return newState;
    });
  }, [state.isPlaying, state.isGameOver, state.difficulty]);

  const gameLoop = useCallback(() => {
    update();
    draw();
    frameRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  const startGame = () => {
    setState(prev => ({
      ...initialState,
      isPlaying: true,
      highScore: prev.highScore,
      difficulty: prev.difficulty
    }));
    lastPipeRef.current = Date.now();
  };

  const handleClick = () => {
    if (state.isGameOver) {
      startGame();
      return;
    }

    if (!state.isPlaying) {
      startGame();
    }

    setState(prev => ({
      ...prev,
      bird: {
        ...prev.bird,
        velocity: FLAP_STRENGTH
      }
    }));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleClick();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <div className="w-full mb-8 flex items-center justify-between">
        <div className="flex gap-4">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => setState(prev => ({ ...prev, difficulty: diff }))}
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
          <div className="text-lg font-semibold text-yellow-500">
            High Score: {state.highScore}
          </div>
          <button
            onClick={startGame}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw size={24} className="dark:text-white" />
          </button>
        </div>
      </div>

      <div 
        className="relative rounded-lg shadow-lg overflow-hidden"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onClick={handleClick}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-lg"
        />

        {!state.isPlaying && !state.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Flappy Bird</h2>
              <p>Click or press space to start</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {state.isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Game Over!</h2>
                <p className="text-lg mb-4 dark:text-gray-300">Score: {state.score}</p>
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Click or press space to flap</p>
        <p className="mt-2">Avoid the pipes and try to get the highest score!</p>
        <p className="mt-2">
          Difficulty affects pipe gap size and spawn rate:
          <br />
          Easy: Wider gaps, slower pipes
          <br />
          Normal: Standard gameplay
          <br />
          Hard: Narrow gaps, faster pipes
        </p>
      </div>
    </div>
  );
};

export default FlappyBird;