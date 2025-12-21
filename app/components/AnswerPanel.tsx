import { AnswerResponse } from '@/lib/types';

interface Props {
  answer: AnswerResponse;
}

export default function AnswerPanel({ answer }: Props) {
  return (
    // White card with gold left border accent
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#D4AF37] space-y-6">
      {/* Answer Summary - Circular badge with number */}
      <div className="border-b-2 border-[#D4AF37] pb-4">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37] text-black text-sm font-bold">
            1
          </span>
          Answer Summary
        </h2>
        <p className="text-[#1a1a1a] leading-relaxed">
          {answer.summary}
        </p>
      </div>
      
      {/* Required Actions - Circular badge with number */}
      <div className="border-b-2 border-[#D4AF37] pb-4">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C8102E] text-white text-sm font-bold">
            2
          </span>
          Required Actions
        </h2>
        {answer.required_actions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2">
            {answer.required_actions.map((action, index) => (
              <li key={index} className="text-[#1a1a1a] pl-2">
                <span className="ml-2">{action}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-600 italic">
            No explicit actions specified in policy.
          </p>
        )}
      </div>
      
      {/* Authority & Escalation - Circular badge with number */}
      <div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] text-[#D4AF37] text-sm font-bold">
            3
          </span>
          Authority & Escalation
        </h2>
        <p className="text-[#1a1a1a]">
          {answer.authority_escalation}
        </p>
      </div>
      
      {/* Policy Gaps (if any) - Triangle warning with bar accent */}
      {answer.policy_gaps && (
        <div className="bg-yellow-50 border-l-4 border-[#C8102E] rounded-r-lg p-4">
          <h2 className="text-lg font-bold text-[#C8102E] mb-2 flex items-center gap-3">
            <span className="text-2xl">▲</span>
            Policy Coverage Check / Gaps
          </h2>
          <p className="text-[#1a1a1a]">
            {answer.policy_gaps}
          </p>
        </div>
      )}
    </div>
  );
}

