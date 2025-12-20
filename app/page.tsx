'use client';

import { useState } from 'react';
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
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enterprise Policy Copilot
          </h1>
          <p className="text-gray-600">
            Decision-support system for policy-backed operational guidance
          </p>
        </div>
        
        {/* Question Input */}
        <div className="mb-8">
          <QuestionInput onSubmit={handleSubmit} loading={loading} />
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Results */}
        {response && (
          <div className="space-y-6">
            {/* Coverage and Gate Scores */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 mb-2">
                    Policy Coverage Status
                  </h2>
                  <CoverageIndicator status={response.answer.coverage} />
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-semibold text-gray-500 mb-2">
                    Confidence Gates
                  </h2>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-medium">Gate 1:</span>{' '}
                      <span className={response.gates.passedMinScore ? 'text-green-600' : 'text-red-600'}>
                        {response.gates.passedMinScore ? 'Passed' : 'Failed'}
                      </span>
                      {' '}(Score: {response.gates.topScore.toFixed(2)})
                    </div>
                    <div>
                      <span className="font-medium">Gate 2:</span>{' '}
                      <span className={response.gates.passedRelativeConfidence ? 'text-green-600' : 'text-yellow-600'}>
                        {response.gates.passedRelativeConfidence ? 'Passed' : 'Conditional'}
                      </span>
                      {response.gates.avgNextScores > 0 && (
                        <>
                          {' '}(Ratio: {(response.gates.topScore / response.gates.avgNextScores).toFixed(2)})
                        </>
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
    </main>
  );
}
