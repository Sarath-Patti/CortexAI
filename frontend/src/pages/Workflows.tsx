import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Workflow, Plus, Zap } from 'lucide-react';

export const Workflows: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Workflow className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Workflows</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Orchestrate automated pipelines, triggers, and execution steps.
          </p>
        </div>

        <Button variant="outline">
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Configured Workflows</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">8</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400">Ready to execute</div>
        </Card>

        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Executions Today</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">14</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400">100% Success Rate</div>
        </Card>

        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Duration</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">1.2s</div>
          <div className="text-[11px] text-slate-500">Low latency pipeline</div>
        </Card>
      </div>

      <Card className="p-8 text-center space-y-4">
        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mx-auto">
          <Zap className="w-8 h-8" />
        </div>
        <div>
          <Badge variant="amber" className="mb-2">Module Ready</Badge>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Workflow Automation Framework Initialized
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Visual workflow graph editing and automated execution engine will be connected in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};
