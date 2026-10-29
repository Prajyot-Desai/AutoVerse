import React, { useState, useEffect, useMemo } from 'react';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';
import { X } from 'lucide-react';

export const ComparisonModal: React.FC = () => {
  const {
    vehicles,
    activeVehicleId,
    isComparisonOpen,
    setIsComparisonOpen,
    getActiveConfig,
    configurations,
  } = useConfiguratorStore();

  // Valid competitors exclude the active vehicle
  const availableCompetitors = useMemo(
    () => vehicles.filter((v) => v.id !== activeVehicleId),
    [vehicles, activeVehicleId]
  );

  const [compareId, setCompareId] = useState<string>(() => {
    const other = vehicles.find((v) => v.id !== activeVehicleId);
    return other ? other.id : '';
  });

  // Automatically update competitor if active vehicle changes or matches compareId
  useEffect(() => {
    if (compareId === activeVehicleId || !availableCompetitors.some((v) => v.id === compareId)) {
      if (availableCompetitors.length > 0) {
        setCompareId(availableCompetitors[0].id);
      }
    }
  }, [activeVehicleId, compareId, availableCompetitors]);

  if (!isComparisonOpen) return null;

  const carA = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  // Guaranteed valid competitor distinct from carA
  const validCompareId =
    compareId !== activeVehicleId && availableCompetitors.some((v) => v.id === compareId)
      ? compareId
      : availableCompetitors[0]?.id;

  const carB = vehicles.find((v) => v.id === validCompareId) || availableCompetitors[0] || vehicles[1];

  const configA = getActiveConfig();
  const configB = configurations[carB.id];

  const rows: { label: string; valA: string; valB: string }[] = [
    { label: 'Category', valA: carA.category, valB: carB.category },
    { label: 'Base MSRP', valA: `$${carA.basePrice.toLocaleString()}`, valB: `$${carB.basePrice.toLocaleString()}` },
    {
      label: 'Configured Price',
      valA: `$${configA.calculatedPrice.toLocaleString()}`,
      valB: `$${configB?.calculatedPrice.toLocaleString() ?? carB.basePrice.toLocaleString()}`,
    },
    { label: '0-100 km/h', valA: carA.specs.acceleration, valB: carB.specs.acceleration },
    { label: 'Top Speed', valA: carA.specs.topSpeed, valB: carB.specs.topSpeed },
    { label: 'Power Output', valA: carA.specs.horsepower, valB: carB.specs.horsepower },
    { label: 'Powertrain', valA: carA.specs.powertrain, valB: carB.specs.powertrain },
    { label: 'Drivetrain', valA: carA.specs.drivetrain, valB: carB.specs.drivetrain },
    { label: 'Curb Weight', valA: carA.specs.weight, valB: carB.specs.weight },
    { label: 'Economy & Range', valA: carA.specs.fuelEconomy, valB: carB.specs.fuelEconomy },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0d0f14] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Comparative Analysis
            </div>
            <h3 className="text-base font-semibold text-white mt-0.5">
              Side-by-Side Model Benchmark
            </h3>
          </div>
          <button
            onClick={() => setIsComparisonOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Selection Header */}
        <div className="grid grid-cols-3 border-b border-white/[0.08] bg-black/40 text-xs font-mono">
          <div className="p-4 text-neutral-400 uppercase tracking-wider flex items-center">
            Metric
          </div>

          {/* Car A */}
          <div className="p-4 border-l border-white/[0.08] bg-white/[0.02]">
            <div className="text-[10px] text-neutral-400">{carA.brand}</div>
            <div className="text-sm font-semibold text-white">{carA.name}</div>
            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                style={{ backgroundColor: configA.selectedPaint.hex }}
              />
              <span>{configA.selectedPaint.name}</span>
            </div>
          </div>

          {/* Car B (Selectable Competitor) */}
          <div className="p-4 border-l border-white/[0.08] bg-white/[0.02]">
            <div className="text-[10px] text-neutral-400 mb-1">Select Competitor:</div>
            <select
              value={carB.id}
              onChange={(e) => setCompareId(e.target.value)}
              className="w-full bg-[#161820] text-white border border-white/15 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-white/40 cursor-pointer"
            >
              {availableCompetitors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.name}
                </option>
              ))}
            </select>
            {configB && (
              <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
                  style={{ backgroundColor: configB.selectedPaint.hex }}
                />
                <span>{configB.selectedPaint.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-white/[0.06] max-h-[55vh] overflow-y-auto">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 text-xs font-mono hover:bg-white/[0.015]">
              <div className="p-3.5 text-neutral-400">{row.label}</div>
              <div className="p-3.5 border-l border-white/[0.08] text-white font-medium">
                {row.valA}
              </div>
              <div className="p-3.5 border-l border-white/[0.08] text-neutral-300">
                {row.valB}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex justify-end">
          <button
            onClick={() => setIsComparisonOpen(false)}
            className="px-4 py-1.5 bg-white text-black font-medium text-xs rounded hover:bg-neutral-200 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
