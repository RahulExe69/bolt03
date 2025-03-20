import React from 'react';
import { Instagram, GamepadIcon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center">
      <GamepadIcon className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mb-6" />
      
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Welcome to Exe Gaming Hub
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
        Your one-stop destination for classic games reimagined with modern UI.
        Choose from 10 different games, play against AI with multiple difficulty levels,
        or challenge your friends!
      </p>
      
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-8">
        <Instagram className="w-5 h-5" />
        <a
          href="https://instagram.com/rahulexez"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          @rahulexez
        </a>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          How to Get Started
        </h2>
        <ol className="text-left text-gray-600 dark:text-gray-300 space-y-2">
          <li>1. Click the menu icon in the top-left corner</li>
          <li>2. Choose your favorite game from the sidebar</li>
          <li>3. Select your preferred game mode and difficulty</li>
          <li>4. Have fun playing!</li>
        </ol>
      </div>
    </div>
  );
};