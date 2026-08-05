import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Cpu, LogOut, LayoutGrid, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/workspaces" className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                CortexAI
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              to="/workspaces"
              className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Workspaces</span>
            </Link>

            <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <div className="p-1.5 bg-slate-800 rounded-full text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">{user?.name}</span>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-900"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/50 py-4 text-center text-xs text-slate-500">
        CortexAI Workspace Management • Milestone v0.2
      </footer>
    </div>
  );
};
