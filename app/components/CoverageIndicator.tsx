import { CoverageStatus } from '@/lib/config';

interface Props {
  status: CoverageStatus;
}

export default function CoverageIndicator({ status }: Props) {
  // Boar's Head branded coverage indicators with geometric shapes
  const styles = {
    'Covered': {
      bg: 'bg-[#D4AF37]', // Gold background
      text: 'text-black',
      border: 'border-[#D4AF37]',
      shape: '●', // Solid circle for complete coverage
      label: 'Fully Covered'
    },
    'Conditional': {
      bg: 'bg-yellow-400', // Yellow/Gold for conditional
      text: 'text-black',
      border: 'border-yellow-500',
      shape: '◐', // Half circle for partial coverage
      label: 'Conditional Coverage'
    },
    'Not Addressed': {
      bg: 'bg-[#C8102E]', // Boar's Head Red
      text: 'text-white',
      border: 'border-[#C8102E]',
      shape: '■', // Square for alert/stop
      label: 'Not Addressed'
    }
  };
  
  const style = styles[status];
  
  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 border-2 rounded-lg font-bold shadow-md ${style.bg} ${style.text} ${style.border}`}>
      <span className="text-2xl">{style.shape}</span>
      <span className="text-base uppercase tracking-wide">{style.label}</span>
    </div>
  );
}

