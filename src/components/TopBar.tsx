import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameStore } from '../store/gameStore';

interface TopBarProps {
  toggleSidebar: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, isDark, toggleTheme }) => {
  const currentGame = useGameStore((state) => state.currentGame);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          {currentGame?.name || 'Exe Gaming Hub'}
        </h1>
        
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
};