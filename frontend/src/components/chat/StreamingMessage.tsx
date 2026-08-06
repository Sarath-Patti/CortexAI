import React from 'react';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  streamedText: string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ streamedText }) => {
  return (
    <div className="flex space-x-3 items-start">
      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500 shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap">
        <span>{streamedText}</span>
        <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle" />
      </div>
    </div>
  );
};
