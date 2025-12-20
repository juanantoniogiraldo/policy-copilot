import { AnswerResponse } from '@/lib/types';

interface Props {
  answer: AnswerResponse;
}

export default function AnswerPanel({ answer }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
      {/* Answer Summary */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Answer Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {answer.summary}
        </p>
      </div>
      
      {/* Required Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Required Actions
        </h2>
        {answer.required_actions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2">
            {answer.required_actions.map((action, index) => (
              <li key={index} className="text-gray-700">
                {action}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500 italic">
            No explicit actions specified in policy.
          </p>
        )}
      </div>
      
      {/* Authority & Escalation */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Authority & Escalation
        </h2>
        <p className="text-gray-700">
          {answer.authority_escalation}
        </p>
      </div>
      
      {/* Policy Gaps (if any) */}
      {answer.policy_gaps && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-yellow-900 mb-2">
            Policy Coverage Check / Gaps
          </h2>
          <p className="text-yellow-800">
            {answer.policy_gaps}
          </p>
        </div>
      )}
    </div>
  );
}

