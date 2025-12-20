import { Citation } from '@/lib/types';

interface Props {
  citations: Citation[];
}

export default function CitationsPanel({ citations }: Props) {
  if (citations.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Policy Citations
      </h2>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="font-semibold text-gray-900">
              {citation.document_id} - {citation.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Section {citation.section} | Version {citation.version} | Effective {citation.effective_date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

