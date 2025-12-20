import { CoverageStatus } from '@/lib/config';

interface Props {
  status: CoverageStatus;
}

export default function CoverageIndicator({ status }: Props) {
  const styles = {
    'Covered': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'Covered'
    },
    'Conditional': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      label: 'Conditional'
    },
    'Not Addressed': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      label: 'Not Addressed'
    }
  };
  
  const style = styles[status];
  
  return (
    <div className={`inline-flex items-center px-4 py-2 border-2 rounded-lg font-semibold ${style.bg} ${style.text} ${style.border}`}>
      <span className="text-lg">{style.label}</span>
    </div>
  );
}

