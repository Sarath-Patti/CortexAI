import React from 'react';
import { Message } from '../../types';
import { Badge } from '../ui/Badge';
import { CitationCard } from './CitationCard';
import { Bot, User, Clock, Zap } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex space-x-3 items-start ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Icon Avatar */}
      <div
        className={`p-2 rounded-xl shrink-0 ${
          isUser
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl text-xs leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none font-mono whitespace-pre-wrap'
          }`}
        >
          {message.content}
        </div>

        {/* Citations Footer */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Source Citations ({message.citations.length})
            </div>
            <div className="grid gap-1.5">
              {message.citations.map((citation, idx) => (
                <CitationCard key={idx} citation={citation} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        {!isUser && (message.provider || message.latency_ms || message.token_usage) && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
            {message.provider && (
              <Badge variant="indigo" size="sm">
                {message.provider.toUpperCase()} ({message.model})
              </Badge>
            )}
            {message.latency_ms && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>{message.latency_ms} ms</span>
              </div>
            )}
            {message.token_usage && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>{message.token_usage.total_tokens} tokens</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
