import React from 'react';
import ThemeToggle from '../UI/ThemeToggle';

const Header = ({ user, activeTab }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'sessions':
        return 'Study Sessions';
      case 'ai-assistant':
        return 'AI Assistant';
      case 'reminders':
        return 'Reminders';
      case 'calendar':
        return 'Calendar';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview of your study progress and upcoming sessions';
      case 'sessions':
        return 'Manage and track your study sessions';
      case 'reminders':
        return 'View and manage your revision reminders';
      case 'calendar':
        return 'Calendar view of your study schedule';
      case 'analytics':
        return 'Analyze your study patterns and progress';
      case 'settings':
        return 'Manage your account and preferences';
      default:
        return 'Welcome to your study dashboard';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 lg:ml-0 ml-12">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{getPageTitle()}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">{getPageDescription()}</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-600 dark:text-gray-300">{getCurrentTime()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, {user?.name}!</p>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
