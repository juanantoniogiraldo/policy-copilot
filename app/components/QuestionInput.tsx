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
    // White card with gold left border accent
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#D4AF37]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/* Label with Boar's Head black text */}
          <label htmlFor="question" className="block text-sm font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
            Enter Policy Question
          </label>
          {/* Textarea with gold focus ring */}
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your policy question here..."
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
            rows={3}
            disabled={loading}
            maxLength={500}
          />
          {/* Character count in gold */}
          <div className="mt-1 text-sm text-[#D4AF37] font-semibold text-right">
            {question.length} / 500 characters
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Submit button - Boar's Head Red with gold hover */}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-8 py-3 bg-[#C8102E] text-white font-bold rounded-lg hover:bg-[#D4AF37] hover:text-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? '🔍 Searching Policies...' : '🚀 Submit Question'}
          </button>
          
          {/* Dropdown with gold focus */}
          <select
            onChange={(e) => setQuestion(e.target.value)}
            value=""
            disabled={loading}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-white font-medium"
          >
            <option value="">📋 Example Questions...</option>
            {exampleQuestions.map((q, i) => (
              <option key={i} value={q}>{q}</option>
            ))}
          </select>
          
          {/* Clear button */}
          {question && (
            <button
              type="button"
              onClick={() => setQuestion('')}
              disabled={loading}
              className="px-4 py-3 text-[#C8102E] hover:text-[#D4AF37] font-semibold transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

