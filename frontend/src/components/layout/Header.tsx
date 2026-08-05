import React from 'react';
import { Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            CortexAI
          </span>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full">
            v0.1 Foundation
          </span>
        </div>
        <nav className="flex items-center space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Documentation
          </a>
        </nav>
      </div>
    </header>
  );
};
