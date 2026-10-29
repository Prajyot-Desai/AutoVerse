import React from 'react';
import { useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface ViewerLoadingOverlayProps {
  vehicleName: string;
}

export const ViewerLoadingOverlay: React.FC<ViewerLoadingOverlayProps> = ({ vehicleName }) => {
  const { active, progress, item } = useProgress();

  if (!active && progress === 100) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090a0d]/85 backdrop-blur-sm select-none transition-opacity duration-300">
      <div className="w-56 p-4 rounded-xl border border-white/[0.08] bg-[#101217]/90 shadow-2xl flex flex-col items-center text-center space-y-3">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            Streaming Geometry
          </div>
          <div className="text-xs font-semibold text-white mt-0.5 truncate max-w-[200px]">
            {vehicleName}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-150 ease-out"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        <div className="w-full flex justify-between items-center text-[10px] font-mono text-neutral-400">
          <span className="truncate max-w-[120px] text-left">
            {item ? item.split('/').pop() : 'Loading...'}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

