import React from 'react';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';
import { RotateCcw, Columns3 } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicle,
    resetCurrentConfig,
    isComparisonOpen,
    setIsComparisonOpen,
    getActiveConfig,
  } = useConfiguratorStore();

  const activeConfig = getActiveConfig();

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#090a0d]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand Identity */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-white/20 bg-white/[0.03] flex items-center justify-center font-mono font-bold text-xs tracking-wider text-white">
            AV
          </div>
          <div>
            <div className="text-sm font-semibold tracking-widest uppercase text-white flex items-center gap-2">
              AutoVerse
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-normal tracking-wider">
                Studio
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
              Precision Configurator
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-white/[0.08]" />

        {/* Vehicle Switcher */}
        <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-md border border-white/[0.06]">
          {vehicles.map((v) => {
            const isActive = v.id === activeVehicleId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVehicle(v.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-150 flex items-center space-x-2 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-400">{v.brand}</span>
                <span>{v.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Dynamic Price Display */}
        <div className="text-right pr-3 border-r border-white/[0.08]">
          <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
            Total Build
          </div>
          <div className="text-sm font-mono font-semibold tracking-tight text-white">
            ${activeConfig.calculatedPrice.toLocaleString()}
          </div>
        </div>

        {/* Reset Config */}
        <button
          onClick={resetCurrentConfig}
          className="p-2 text-neutral-400 hover:text-white rounded border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] transition-colors"
          title="Reset to factory build"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Comparison Toggle */}
        <button
          onClick={() => setIsComparisonOpen(!isComparisonOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            isComparisonOpen
              ? 'bg-white text-black border-white'
              : 'text-neutral-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
          }`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
      </div>
    </header>
  );
};
