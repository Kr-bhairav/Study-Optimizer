import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      style={{
        backgroundColor: isDarkMode ? '#3b82f6' : '#e5e7eb'
      }}
    >
      {/* Toggle Circle */}
      <span
        className="inline-block w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-300 ease-in-out flex items-center justify-center text-xs"
        style={{
          transform: isDarkMode ? 'translateX(24px)' : 'translateX(2px)'
        }}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default ThemeToggle;
