import React, { useEffect, useState } from 'react';
import { fetchHealthStatus } from '../api/health';
import { HealthStatus } from '../types';
import { Activity, ShieldCheck, Layers, Server } from 'lucide-react';

export const Home: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthStatus()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to backend service');
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Milestone v0.1 Completed</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          CortexAI Project Foundation
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          The clean, modular, production-ready architecture establishing the core engineering standard for backend and frontend services.
        </p>
      </section>

      {/* System Status Component */}
      <section className="max-w-2xl mx-auto glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Backend Health Check</h2>
          </div>
          <span className="flex items-center space-x-2 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-500' : 'bg-emerald-400'}`} />
            <span>{loading ? 'Checking...' : error ? 'Offline' : 'Connected'}</span>
          </span>
        </div>

        {loading && (
          <p className="text-sm text-slate-400 animate-pulse">Ping backend health endpoint...</p>
        )}

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl text-sm text-red-300">
            {error} (Ensure FastAPI server is running on port 8000)
          </div>
        )}

        {health && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs text-slate-500 mb-1">Status</span>
              <span className="text-sm font-semibold text-emerald-400 uppercase">{health.status}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs text-slate-500 mb-1">Version</span>
              <span className="text-sm font-semibold text-slate-200">{health.version}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="block text-xs text-slate-500 mb-1">Environment</span>
              <span className="text-sm font-semibold text-indigo-300 capitalize">{health.environment}</span>
            </div>
          </div>
        )}
      </section>

      {/* Feature Architecture Overview */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 w-fit rounded-xl text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Backend Architecture</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Modular FastAPI package structure with centralized configuration, structured logging, CORS handling, and versioned routing endpoints (`/api/v1`).
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 w-fit rounded-xl text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Frontend Architecture</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            React 18 + TypeScript SPA powered by Vite, styled with Tailwind CSS, configured with client routing, and a clean typed API abstraction layer.
          </p>
        </div>
      </section>
    </div>
  );
};
