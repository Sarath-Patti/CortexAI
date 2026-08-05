import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { User, Settings, LogOut, Sun, Moon, Laptop, ShieldCheck } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <Dropdown
      align="right"
      trigger={
        <div className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
              {user?.name}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {user?.email}
            </div>
          </div>
        </div>
      }
    >
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
          {user?.name}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {user?.email}
        </p>
        <div className="mt-1.5 inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>Authenticated</span>
        </div>
      </div>

      <div className="py-1">
        <DropdownItem
          icon={<User className="w-4 h-4" />}
          onClick={() => navigate('/settings')}
        >
          Profile Settings
        </DropdownItem>
        <DropdownItem
          icon={<Settings className="w-4 h-4" />}
          onClick={() => navigate('/settings')}
        >
          Preferences
        </DropdownItem>
        <DropdownItem
          icon={
            resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : theme === 'system' ? (
              <Laptop className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )
          }
          onClick={cycleTheme}
        >
          Theme: <span className="capitalize">{theme}</span>
        </DropdownItem>
      </div>

      <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
        <DropdownItem
          destructive
          icon={<LogOut className="w-4 h-4" />}
          onClick={logout}
        >
          Log Out
        </DropdownItem>
      </div>
    </Dropdown>
  );
};
