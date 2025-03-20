import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Game } from '../types/game';
import { GamepadIcon, XSquare, Cake as Snake, Bird, Calculator, Brain, ChevronRight as ChessKnight, Dice1 as Dice, Grid3X3, Circle, HandMetal } from 'lucide-react';

const games: Game[] = [
  { id: 1, name: 'Tic-Tac-Toe', description: 'Classic X & O game', icon: 'XSquare', hasBot: true, maxPlayers: 2 },
  { id: 2, name: 'Snake Game', description: 'Classic snake game', icon: 'Snake', hasBot: false, maxPlayers: 1 },
  { id: 3, name: 'Flappy Bird', description: 'Avoid obstacles', icon: 'Bird', hasBot: false, maxPlayers: 1 },
  { id: 4, name: '2048', description: 'Merge tiles puzzle', icon: 'Calculator', hasBot: false, maxPlayers: 1 },
  { id: 5, name: 'Memory Cards', description: 'Find matching pairs', icon: 'Brain', hasBot: false, maxPlayers: 1 },
  { id: 6, name: 'Chess', description: 'Strategic board game', icon: 'ChessKnight', hasBot: true, maxPlayers: 2 },
  { id: 7, name: 'Ludo', description: 'Classic board game', icon: 'Dice', hasBot: true, maxPlayers: 4 },
  { id: 8, name: 'Sudoku', description: 'Number puzzle game', icon: 'Grid3X3', hasBot: false, maxPlayers: 1 },
  { id: 9, name: 'Bubble Shooter', description: 'Match-3 bubble game', icon: 'Circle', hasBot: false, maxPlayers: 1 },
  { id: 10, name: 'Rock Paper Scissors', description: 'Hand game', icon: 'HandMetal', hasBot: true, maxPlayers: 2 },
];

const iconComponents: { [key: string]: React.FC<any> } = {
  XSquare, Snake, Bird, Calculator, Brain,
  ChessKnight, Dice, Grid3X3, Circle, HandMetal
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { setCurrentGame } = useGameStore();

  const handleGameSelect = (game: Game) => {
    setCurrentGame(game);
    onClose();
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-40
      ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <GamepadIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Games</h2>
        </div>
        
        <div className="space-y-2">
          {games.map((game) => {
            const Icon = iconComponents[game.icon];
            return (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game)}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{game.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{game.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};