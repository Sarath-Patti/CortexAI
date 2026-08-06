import React, { useEffect, useRef, useState } from 'react';
import { Conversation, ModelInfo, ProviderInfo } from '../../types';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';
import { Button } from '../ui/Button';
import {
  Send,
  Sparkles,
  Bot,
  Database,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download,
} from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  providers: ProviderInfo[];
  models: ModelInfo[];
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (p: string) => void;
  onModelChange: (m: string) => void;
  onSendMessage: (
    prompt: string,
    systemPrompt: string,
    ragEnabled: boolean,
    isStream: boolean
  ) => Promise<void>;
  onExport: (format: 'markdown' | 'json') => void;
  loading: boolean;
  streaming: boolean;
  streamedText: string;
  error: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  providers,
  models,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  onSendMessage,
  onExport,
  loading,
  streaming,
  streamedText,
  error,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are CortexAI, an enterprise intelligent assistant designed to assist users with precision, structure, and factual context.'
  );
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [isStream, setIsStream] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamedText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading || streaming) return;
    const currentPrompt = prompt;
    setPrompt('');
    await onSendMessage(currentPrompt, systemPrompt, ragEnabled, isStream);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const starterSuggestions = [
    'Explain the architecture of CortexAI RAG pipeline.',
    'Summarize the core benefits of a provider abstraction layer.',
    'Compare PostgreSQL with ChromaDB vector embeddings.',
    'Draft an enterprise security guideline for API token storage.',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header Bar */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-3 truncate">
          <Bot className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="truncate">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {conversation?.title || 'Select or Start a Conversation'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {conversation
                ? `Thread ID: ${conversation.id.slice(0, 8)}...`
                : 'Persistent Enterprise Chat Platform'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Settings</span>
            {showSettings ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {conversation && (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('markdown')}
                title="Export Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel Drawer */}
      {showSettings && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 grid sm:grid-cols-3 gap-4 text-xs shrink-0 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
            >
              {providers.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name.toUpperCase()} {p.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              System Instructions
            </label>
            <input
              type="text"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-xs shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Message List Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!conversation || !conversation.messages || conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 my-auto py-12">
            <div className="p-4 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl text-indigo-500 shadow-xl">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How can CortexAI assist you today?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Persistent multi-turn conversation platform backed by unified AI runtime and ChromaDB RAG retrieval.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 w-full">
              {starterSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(s)}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          conversation.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))
        )}

        {/* Streaming Animation */}
        {streaming && <StreamingMessage streamedText={streamedText} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ragEnabled}
                onChange={(e) => setRagEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="flex items-center space-x-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                <Database className="w-3.5 h-3.5" />
                <span>RAG Document Retrieval</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isStream}
                onChange={(e) => setIsStream(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                SSE Streaming
              </span>
            </label>
          </div>

          <div className="flex gap-2 items-end bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500 transition-colors">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CortexAI a question... (Shift+Enter for newline, Enter to submit)"
              className="flex-1 px-3 py-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
            />
            <Button
              type="submit"
              isLoading={loading || streaming}
              disabled={!prompt.trim() || loading || streaming}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
