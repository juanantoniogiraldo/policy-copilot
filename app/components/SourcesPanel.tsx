'use client';

import { useState } from 'react';
import { PolicyChunk } from '@/lib/types';

interface Props {
  sources: PolicyChunk[];
  scores: number[];
}

export default function SourcesPanel({ sources, scores }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  if (sources.length === 0) {
    return null;
  }
  
  return (
    // White card with gold left border accent
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#D4AF37]">
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <span className="text-[#D4AF37]">🔍</span>
        Retrieved Policy Sources
      </h2>
      <div className="space-y-3">
        {sources.map((source, index) => (
          // Each source card with gold left border
          <div key={index} className="border-l-4 border-[#D4AF37] border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-[#C8102E] flex items-center gap-2">
                    <span className="bg-[#D4AF37] text-black px-2 py-1 rounded text-xs font-bold">
                      {source.document_id}
                    </span>
                    <span className="text-[#1a1a1a]">Section {source.section_number}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 font-medium">
                    {source.section_title}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[#D4AF37] font-bold">
                    Score: <span className="font-mono">{scores[index].toFixed(2)}</span>
                  </div>
                  <div className="text-[#C8102E] font-bold text-lg">
                    {expandedIndex === index ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </button>
            
            {expandedIndex === index && (
              <div className="p-4 bg-gray-50 border-t-2 border-[#D4AF37]">
                <div className="text-sm text-[#1a1a1a] whitespace-pre-wrap leading-relaxed">
                  {source.content}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600 flex items-center gap-3">
                  <span className="font-semibold">Version: {source.version}</span>
                  <span>•</span>
                  <span>Effective: {source.effective_date}</span>
                  <span>•</span>
                  <span>Tokens: {source.token_count}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

