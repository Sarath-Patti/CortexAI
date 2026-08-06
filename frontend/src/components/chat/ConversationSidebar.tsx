import React, { useState } from 'react';
import { Conversation } from '../../types';
import { ConversationSearch } from './ConversationSearch';
import { Button } from '../ui/Button';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Download,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: 'markdown' | 'json') => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onExport,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col h-full shrink-0">
      {/* Header & Create Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <Button onClick={onCreate} className="w-full justify-center">
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </Button>
        <ConversationSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No conversations found.
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate flex-1 min-w-0 pr-2">
                  <MessageSquare className="w-4 h-4 shrink-0 text-indigo-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-indigo-500 rounded text-xs focus:outline-none"
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => saveRename(conv.id, e)}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 text-slate-400 hover:text-indigo-500 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExport(conv.id, 'markdown');
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-500 rounded"
                        title="Export Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>v0.6 Engine</span>
        </div>
        <span>{conversations.length} threads</span>
      </div>
    </div>
  );
};
