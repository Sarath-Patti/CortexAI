import React, { useEffect, useMemo, useState } from 'react';
import { createWorkspaceApi, getWorkspacesApi } from '../api/workspaces';
import { Workspace } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  FileText,
  Workflow,
  FolderX,
} from 'lucide-react';

export const WorkspaceList: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');

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

  const filteredAndSortedWorkspaces = useMemo(() => {
    return workspaces
      .filter((ws) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          ws.name.toLowerCase().includes(query) ||
          (ws.description && ws.description.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }, [workspaces, searchQuery, sortBy]);

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
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, configure, and isolate your enterprise environments.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search workspaces by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            </Card>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedWorkspaces.length === 0 && (
        <Card className="text-center py-16 max-w-md mx-auto space-y-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full w-fit mx-auto">
            <FolderX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching workspaces' : 'No workspaces found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-4">
              {searchQuery
                ? `No workspaces matched "${searchQuery}". Try a different keyword.`
                : 'Create your first workspace to start organizing your files and workflows.'}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </Button>
        </Card>
      )}

      {/* Workspaces Grid */}
      {!loading && !error && filteredAndSortedWorkspaces.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedWorkspaces.map((ws) => (
            <Card
              key={ws.id}
              className="group hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate max-w-[180px]">
                      {ws.name}
                    </h3>
                  </div>
                  <Badge variant="indigo" size="sm">Active</Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {ws.description || 'No description provided for this workspace environment.'}
                </p>

                {/* Placeholders for documents & workflows */}
                <div className="flex items-center space-x-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>12 Docs</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Workflow className="w-3.5 h-3.5 text-slate-400" />
                    <span>3 Flows</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>
                    Updated {new Date(ws.updated_at).toLocaleDateString()}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  ID: {ws.id.slice(0, 8)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Workspace"
        description="Add a new workspace environment to organize your data."
      >
        {createError && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Workspace Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Finance Analytics"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              placeholder="Provide a brief summary of the workspace purpose..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
