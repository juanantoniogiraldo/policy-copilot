'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (question: string) => void;
  loading: boolean;
}

export default function QuestionInput({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState('');
  
  const exampleQuestions = [
    "What do we do if allergen cross-contact is suspected?",
    "What is our weekend incident protocol?",
    "How do we handle supplier ingredient issues?",
    "What do we do about social media complaints?",
    "How long should we hold product with a sanitation deviation?"
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onSubmit(question.trim());
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
            Enter Policy Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your policy question here..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={loading}
            maxLength={500}
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {question.length} / 500 characters
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching Policies...' : 'Submit Question'}
          </button>
          
          <select
            onChange={(e) => setQuestion(e.target.value)}
            value=""
            disabled={loading}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Example Questions...</option>
            {exampleQuestions.map((q, i) => (
              <option key={i} value={q}>{q}</option>
            ))}
          </select>
          
          {question && (
            <button
              type="button"
              onClick={() => setQuestion('')}
              disabled={loading}
              className="px-4 py-3 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

