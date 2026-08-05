import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getWorkspacesApi } from '../api/workspaces';
import { Workspace } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  FolderKanban,
  FileText,
  Workflow,
  Sparkles,
  Plus,
  Upload,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getWorkspacesApi()
      .then((data) => {
        setWorkspaces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Workspaces',
      value: workspaces.length.toString(),
      subtext: 'Active workspaces',
      icon: FolderKanban,
      color: 'indigo',
    },
    {
      label: 'Documents',
      value: '24',
      subtext: 'Indexed documents',
      icon: FileText,
      color: 'emerald',
    },
    {
      label: 'Workflows',
      value: '8',
      subtext: 'Configured flows',
      icon: Workflow,
      color: 'amber',
    },
    {
      label: 'AI Tasks',
      value: '142',
      subtext: 'Executed actions',
      icon: Sparkles,
      color: 'purple',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Workspace Initialized',
      description: 'System workspace default configuration created.',
      time: '10 mins ago',
      type: 'system',
    },
    {
      id: '2',
      title: 'Document Indexing Complete',
      description: 'Architecture documentation ingested.',
      time: '1 hour ago',
      type: 'document',
    },
    {
      id: '3',
      title: 'Workflow Execution Succeeded',
      description: 'Data transformation pipeline executed cleanly.',
      time: '3 hours ago',
      type: 'workflow',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Workspace Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage your workspaces, knowledge base, and automated workflows from your centralized enterprise control center.
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading && stat.label === 'Total Workspaces' ? '...' : stat.value}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {stat.subtext}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Workspaces */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (Workspaces & Actions) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/workspaces')}
                className="glass-card p-4 rounded-2xl flex items-center space-x-3 text-left hover:border-indigo-500/50 transition-all group"
              >
                <div className="p-3 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Create Workspace
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Add new workspace environment
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/knowledge')}
                className="glass-card p-4 rounded-2xl flex items-center space-x-3 text-left hover:border-indigo-500/50 transition-all group"
              >
                <div className="p-3 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Upload Document
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Add files to knowledge base
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/workflows')}
                className="glass-card p-4 rounded-2xl flex items-center space-x-3 text-left hover:border-indigo-500/50 transition-all group"
              >
                <div className="p-3 bg-amber-600/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    New Workflow
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Automate task execution
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="glass-card p-4 rounded-2xl flex items-center space-x-3 text-left hover:border-indigo-500/50 transition-all group"
              >
                <div className="p-3 bg-purple-600/10 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Configure Preferences
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Customize account & theme
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Recent Workspaces Preview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Workspaces
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/workspaces')}
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading workspaces...
              </div>
            ) : workspaces.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  No workspaces created yet.
                </p>
                <Button size="sm" onClick={() => navigate('/workspaces')}>
                  Create your first workspace
                </Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {workspaces.slice(0, 4).map((ws) => (
                  <Card
                    key={ws.id}
                    className="hover:border-indigo-500/50 cursor-pointer transition-all"
                    onClick={() => navigate('/workspaces')}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {ws.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
                      {ws.description || 'No description provided.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Updated {new Date(ws.updated_at).toLocaleDateString()}</span>
                      <Badge variant="indigo" size="sm">Active</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Activity Feed) */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <Card className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {act.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {act.description}
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
