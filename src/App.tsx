import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { useGameStore } from './store/gameStore';
import TicTacToe from './games/TicTacToe/TicTacToe';
import Snake from './games/Snake/Snake';
import FlappyBird from './games/FlappyBird/FlappyBird';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentGame = useGameStore((state) => state.currentGame);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderGame = () => {
    if (!currentGame) return <Dashboard />;
    
    switch (currentGame.name) {
      case 'Tic-Tac-Toe':
        return <TicTacToe />;
      case 'Snake Game':
        return <Snake />;
      case 'Flappy Bird':
        return <FlappyBird />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300 pointer-events-none ${
        isDark 
          ? 'opacity-20 bg-[url(https://images.unsplash.com/photo-1519681393784-d120267933ba)]' 
          : 'opacity-10 bg-[url(https://images.unsplash.com/photo-1598899134739-24c46f58b8c0)]'
      }`} />

      <TopBar
        toggleSidebar={toggleSidebar}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className="pt-16 relative">
        {renderGame()}
      </main>
    </div>
  );
}

export default App;