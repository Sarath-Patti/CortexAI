import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/60 bg-slate-950/50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CortexAI. Engineering Foundation v0.1.</p>
        <p className="flex items-center space-x-2">
          <span>FastAPI</span>
          <span>•</span>
          <span>React + Vite</span>
          <span>•</span>
          <span>Tailwind CSS</span>
        </p>
      </div>
    </footer>
  );
};
