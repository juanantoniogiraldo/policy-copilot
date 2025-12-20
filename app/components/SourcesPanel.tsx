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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Retrieved Policy Sources
      </h2>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {source.document_id} - Section {source.section_number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {source.section_title}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    BM25 Score: <span className="font-mono font-semibold">{scores[index].toFixed(2)}</span>
                  </div>
                  <div className="text-gray-400">
                    {expandedIndex === index ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </button>
            
            {expandedIndex === index && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {source.content}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Version: {source.version} | Effective: {source.effective_date} | Tokens: {source.token_count}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

