import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { UserMenu } from './UserMenu';
import { Menu, Sun, Moon, Search } from 'lucide-react';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/workspaces':
        return 'Workspaces';
      case '/knowledge':
        return 'Knowledge Base';
      case '/workflows':
        return 'Workflows';
      case '/settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 glass-nav sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden sm:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workspaces..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <UserMenu />
      </div>
    </header>
  );
};
