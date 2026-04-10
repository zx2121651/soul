import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

export default function PageHeader({ title, rightAction, onBack, transparent = false }: PageHeaderProps) {
  // @ts-ignore
  const _t = transparent; // silence the unused error if string interpolation is removed
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`sticky top-0 z-50 flex items-center justify-between px-4 h-14 w-full \${transparent ? 'bg-gradient-to-b from-black/60 to-transparent' : 'bg-[#12141d]/90 backdrop-blur-md border-b border-white/5'}`}>
      <button
        onClick={handleBack}
        className="w-10 h-10 flex items-center justify-start text-white active:opacity-50 transition-opacity"
      >
        <ChevronLeft size={24} />
      </button>

      <h1 className="text-white font-medium text-lg flex-1 text-center truncate px-2">
        {title}
      </h1>

      <div className="w-10 h-10 flex items-center justify-end text-white">
        {rightAction}
      </div>
    </div>
  );
}
