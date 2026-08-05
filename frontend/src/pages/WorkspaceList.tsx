import React, { useEffect, useState } from 'react';
import { createWorkspaceApi, getWorkspacesApi } from '../api/workspaces';
import { Workspace } from '../types';
import { Plus, Folder, Calendar, X, Layers } from 'lucide-react';

export const WorkspaceList: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await getWorkspacesApi();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      await createWorkspaceApi({ name, description });
      setName('');
      setDescription('');
      setIsModalOpen(false);
      await fetchWorkspaces();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create workspace.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Workspaces</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your persistent workspace environments
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-2xl space-y-4 animate-pulse"
            >
              <div className="h-5 bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800/50 rounded-xl text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && workspaces.length === 0 && (
        <div className="text-center py-16 glass-card rounded-2xl space-y-4 max-w-md mx-auto">
          <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 w-fit mx-auto rounded-full text-indigo-400">
            <Folder className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-white">No Workspaces Found</h2>
          <p className="text-sm text-slate-400 px-6">
            Get started by creating your first workspace.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </button>
        </div>
      )}

      {/* Workspace Cards */}
      {!loading && !error && workspaces.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="glass-card p-6 rounded-2xl hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-105 transition-transform">
                    <Folder className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white truncate">
                    {workspace.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {workspace.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(workspace.created_at).toLocaleDateString()}
                  </span>
                </span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full glass-card p-6 rounded-2xl shadow-2xl space-y-6 relative border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-semibold text-white">Create New Workspace</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-sm text-red-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g., Core Analytics"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Brief workspace objective or scope..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
