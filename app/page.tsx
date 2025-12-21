'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QueryResponse } from '@/lib/types';
import QuestionInput from './components/QuestionInput';
import CoverageIndicator from './components/CoverageIndicator';
import AnswerPanel from './components/AnswerPanel';
import CitationsPanel from './components/CitationsPanel';
import SourcesPanel from './components/SourcesPanel';

export default function Home() {
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (question: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Request failed');
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      {/* Boar's Head Header - Red background with white text */}
      <header className="bg-[#C8102E] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Boar's Head Logo - CSS transparent white background */}
            <div className="h-16 w-auto flex items-center">
              <Image 
                src="/boars-head-logo.png" 
                alt="Boar's Head" 
                width={120}
                height={64}
                className="object-contain"
                style={{ 
                  mixBlendMode: 'multiply',
                  opacity: 1
                }}
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Policy Copilot
              </h1>
              <p className="text-[#D4AF37] font-semibold">
                Enterprise Decision Support System
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subtitle - Black text */}
        <div className="mb-6 text-center">
          <p className="text-[#1a1a1a] text-lg">
            AI-powered policy guidance for compliance-driven operational decisions
          </p>
        </div>
        
        {/* Question Input */}
        <div className="mb-8">
          <QuestionInput onSubmit={handleSubmit} loading={loading} />
        </div>
        
        {/* Error Display - Boar's Head Red theme */}
        {error && (
          <div className="mb-8 p-4 bg-[#C8102E] border-2 border-[#D4AF37] rounded-lg shadow-md">
            <p className="text-white font-bold text-lg">⚠️ Error</p>
            <p className="text-white mt-1">{error}</p>
          </div>
        )}
        
        {/* Results */}
        {response && (
          <div className="space-y-6">
            {/* Coverage and Gate Scores - Gold accent border */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
                    Policy Coverage Status
                  </h2>
                  <CoverageIndicator status={response.answer.coverage} />
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
                    Confidence Gates
                  </h2>
                  <div className="text-sm text-[#1a1a1a] space-y-2">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-semibold">Gate 1:</span>
                      <span className={response.gates.passedMinScore ? 'px-2 py-1 bg-[#D4AF37] text-black font-bold rounded' : 'px-2 py-1 bg-[#C8102E] text-white font-bold rounded'}>
                        {response.gates.passedMinScore ? '✓ Passed' : '✗ Failed'}
                      </span>
                      <span className="text-xs text-gray-600">(Score: {response.gates.topScore.toFixed(2)})</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-semibold">Gate 2:</span>
                      <span className={response.gates.passedRelativeConfidence ? 'px-2 py-1 bg-[#D4AF37] text-black font-bold rounded' : 'px-2 py-1 bg-yellow-500 text-black font-bold rounded'}>
                        {response.gates.passedRelativeConfidence ? '✓ Passed' : '⚠ Conditional'}
                      </span>
                      {response.gates.avgNextScores > 0 && (
                        <span className="text-xs text-gray-600">
                          (Ratio: {(response.gates.topScore / response.gates.avgNextScores).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Answer Panel */}
            <AnswerPanel answer={response.answer} />
            
            {/* Citations */}
            <CitationsPanel citations={response.answer.citations} />
            
            {/* Sources */}
            <SourcesPanel sources={response.sources} scores={response.scores} />
          </div>
        )}
      </div>

      {/* Footer - Black background with white text and gold accent */}
      <footer className="bg-[#1a1a1a] mt-16 py-8 border-t-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-white text-sm mb-2">
              <span className="text-[#D4AF37] font-bold">Boar's Head Brand®</span> Policy Copilot
            </p>
            <p className="text-gray-400 text-xs mb-3">
              This system provides policy guidance based on approved documentation. 
              Always verify critical decisions with QA and Legal & Compliance.
            </p>
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Boar's Head Provisions Co., Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
