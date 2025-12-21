import { Citation } from '@/lib/types';

interface Props {
  citations: Citation[];
}

export default function CitationsPanel({ citations }: Props) {
  if (citations.length === 0) {
    return null;
  }
  
  return (
    // White card with gold left border accent
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-[#D4AF37]">
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
        <span className="text-[#D4AF37]">📚</span>
        Policy Citations
      </h2>
      <div className="space-y-4">
        {citations.map((citation, index) => (
          // Each citation has gold left border
          <div key={index} className="border-l-4 border-[#D4AF37] bg-gray-50 pl-4 py-3 rounded-r-lg">
            <div className="font-bold text-[#C8102E] flex items-center gap-2">
              <span className="bg-[#D4AF37] text-black px-2 py-1 rounded text-xs font-bold">
                {citation.document_id}
              </span>
              <span className="text-[#1a1a1a]">{citation.title}</span>
            </div>
            <div className="text-sm text-gray-700 mt-2 flex items-center gap-3">
              <span className="font-semibold">Section {citation.section}</span>
              <span>•</span>
              <span>Version {citation.version}</span>
              <span>•</span>
              <span>Effective {citation.effective_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

