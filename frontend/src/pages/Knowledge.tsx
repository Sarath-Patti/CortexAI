import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileText, Upload, Database } from 'lucide-react';

export const Knowledge: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Knowledge Base</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Central repository for enterprise documentation, knowledge collections, and unstructured content.
          </p>
        </div>

        <Button variant="outline">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Documents</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">24</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Indexed & Searchable</div>
        </Card>

        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Collections</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">4</div>
          <div className="text-[11px] text-slate-500">Knowledge partitions</div>
        </Card>

        <Card className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Storage Used</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">12.4 MB</div>
          <div className="text-[11px] text-slate-500">Optimized index format</div>
        </Card>
      </div>

      <Card className="p-8 text-center space-y-4">
        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mx-auto">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <Badge variant="emerald" className="mb-2">Module Ready</Badge>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Document & Knowledge Shell Initialized
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Future milestones will enable advanced document indexing, chunking, and search capabilities.
          </p>
        </div>
      </Card>
    </div>
  );
};
