import React, { useState } from 'react';
import { CitationItem } from '../../types';
import { Badge } from '../ui/Badge';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface CitationCardProps {
  citation: CitationItem;
  index: number;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, index }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1 text-xs">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2 text-slate-300 font-semibold truncate">
          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">
            [{index + 1}] {citation.filename} (Page {citation.page_number})
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Badge variant="emerald" size="sm">
            {(citation.similarity_score * 100).toFixed(1)}%
          </Badge>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && citation.snippet && (
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
          {citation.snippet}
        </div>
      )}
    </div>
  );
};
