import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, User, Cpu, Trophy, Medal } from 'lucide-react';
import { Player, Board, GameStatus, GameMode, Difficulty, GameState } from './types';
import { checkWinner, getBestMove } from './ai';

const initialState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  status: 'playing',
  winner: null,
  winningLine: null,
  gameMode: 'ai',
  difficulty: 'normal'
};

const TicTacToe: React.FC = () => {
  const [state, setState] = useState<GameState>(initialState);
  const [showEndScreen, setShowEndScreen] = useState(false);

  useEffect(() => {
    if (state.status === 'won' || state.status === 'draw') {
      const timer = setTimeout(() => setShowEndScreen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  useEffect(() => {
    if (state.gameMode === 'ai' && state.currentPlayer === 'O' && state.status === 'playing') {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...state.board], state.difficulty);
        handleCellClick(bestMove);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.gameMode]);

  const handleCellClick = (index: number) => {
    if (state.board[index] || state.status !== 'playing') return;

    const newBoard = [...state.board];
    newBoard[index] = state.currentPlayer;

    const { winner, line } = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every(cell => cell !== null);

    setState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      status: winner ? 'won' : isDraw ? 'draw' : 'playing',
      winner,
      winningLine: line
    }));
  };

  const resetGame = () => {
    setState(prev => ({ ...initialState, gameMode: prev.gameMode, difficulty: prev.difficulty }));
    setShowEndScreen(false);
  };

  const Cell: React.FC<{ index: number; value: Player | null }> = ({ index, value }) => {
    const isWinning = state.winningLine?.includes(index);
    
    return (
      <motion.button
        className={`w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-md
          flex items-center justify-center text-4xl font-bold
          ${!value && state.status === 'playing' ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
          ${isWinning ? 'bg-green-100 dark:bg-green-900' : ''}`}
        whileHover={!value && state.status === 'playing' ? { scale: 0.95 } : {}}
        whileTap={!value && state.status === 'playing' ? { scale: 0.9 } : {}}
        onClick={() => handleCellClick(index)}
      >
        <AnimatePresence mode="wait">
          {value && (
            <motion.span
              key={value}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className={value === 'X' ? 'text-blue-600' : 'text-red-600'}
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4">
      <div className="w-full mb-8 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setState(prev => ({ ...prev, gameMode: 'pvp' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${state.gameMode === 'pvp' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            <User size={20} /> vs <User size={20} />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, gameMode: 'ai' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${state.gameMode === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            <User size={20} /> vs <Cpu size={20} />
          </button>
        </div>
        <button
          onClick={resetGame}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCcw size={24} />
        </button>
      </div>

      {state.gameMode === 'ai' && (
        <div className="w-full mb-8 flex justify-center gap-4">
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
      )}

      <div className="relative w-full aspect-square grid grid-cols-3 gap-4 mb-8">
        {state.board.map((cell, index) => (
          <Cell key={index} index={index} value={cell} />
        ))}
      </div>

      <AnimatePresence>
        {showEndScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
              {state.winner ? (
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              ) : (
                <Medal className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold mb-4">
                {state.winner ? `Player ${state.winner} Wins!` : "It's a Draw!"}
              </h2>
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
  );
};

export default TicTacToe;