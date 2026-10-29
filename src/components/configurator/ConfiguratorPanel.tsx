import React from 'react';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';
import { ConfiguratorTab } from '../../types/configurator';
import { Palette, Disc, Shield, Gauge, Sliders } from 'lucide-react';

export const ConfiguratorPanel: React.FC = () => {
  const {
    getActiveVehicle,
    getActiveConfig,
    activeTab,
    setActiveTab,
    setPaint,
    setWheel,
    setInterior,
    setCaliper,
  } = useConfiguratorStore();

  const vehicle = getActiveVehicle();
  const config = getActiveConfig();

  const tabs: { id: ConfiguratorTab; label: string; icon: React.ElementType }[] = [
    { id: 'exterior', label: 'Exterior', icon: Palette },
    { id: 'wheels', label: 'Wheels', icon: Disc },
    { id: 'calipers', label: 'Brakes', icon: Shield },
    { id: 'interior', label: 'Interior', icon: Sliders },
    { id: 'summary', label: 'Specs', icon: Gauge },
  ];

  return (
    <aside className="w-96 border-l border-white/[0.08] bg-[#0c0d12] flex flex-col h-full z-20 shrink-0">
      {/* Category Tabs */}
      <div className="flex border-b border-white/[0.08] bg-[#090a0d]/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                isActive
                  ? 'text-white bg-white/[0.04]'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* EXTERIOR TAB */}
        {activeTab === 'exterior' && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Finish & Body Paint
              </div>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {config.selectedPaint.name}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300">
                  {config.selectedPaint.finish} finish
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {config.selectedPaint.price === 0
                    ? 'Included'
                    : `+$${config.selectedPaint.price.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Paint Grid */}
            <div className="grid grid-cols-3 gap-3">
              {vehicle.paintOptions.map((paint) => {
                const isSelected = config.selectedPaint.id === paint.id;
                return (
                  <button
                    key={paint.id}
                    onClick={() => setPaint(paint)}
                    className={`group relative p-2.5 rounded-lg border text-left transition-all duration-150 flex flex-col items-center justify-center space-y-2 ${
                      isSelected
                        ? 'border-white bg-white/[0.06] ring-1 ring-white/40'
                        : 'border-white/[0.08] bg-black/20 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-inner border border-white/20 relative"
                      style={{ backgroundColor: paint.hex }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-[#0c0d12]" />
                      )}
                    </div>
                    <div className="text-center w-full">
                      <div className="text-[11px] font-medium text-neutral-200 truncate w-full">
                        {paint.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {paint.price === 0 ? 'Inc.' : `+$${paint.price}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Material Attributes Preview */}
            <div className="p-3.5 rounded-lg border border-white/[0.06] bg-black/30 space-y-2.5">
              <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                PBR Surface Physics
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Roughness:</span>
                  <span>{config.selectedPaint.roughness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Metalness:</span>
                  <span>{config.selectedPaint.metalness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Clearcoat:</span>
                  <span>{config.selectedPaint.clearcoat ?? 1.0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">HEX Code:</span>
                  <span className="uppercase">{config.selectedPaint.hex}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WHEELS TAB */}
        {activeTab === 'wheels' && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Wheel & Rim Design
              </div>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {config.selectedWheel.name}
              </h2>
              <div className="text-xs font-mono text-neutral-400 mt-1">
                {config.selectedWheel.price === 0
                  ? 'Included'
                  : `+$${config.selectedWheel.price.toLocaleString()}`}
              </div>
            </div>

            <div className="space-y-2.5">
              {vehicle.wheelOptions.map((wheel) => {
                const isSelected = config.selectedWheel.id === wheel.id;
                return (
                  <button
                    key={wheel.id}
                    onClick={() => setWheel(wheel)}
                    className={`w-full p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-white bg-white/[0.06] ring-1 ring-white/40'
                        : 'border-white/[0.08] bg-black/20 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-7 h-7 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: wheel.colorHex }}
                      />
                      <div>
                        <div className="text-xs font-medium text-neutral-200">
                          {wheel.name}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {wheel.finish}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-neutral-300">
                      {wheel.price === 0 ? 'Included' : `+$${wheel.price.toLocaleString()}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CALIPERS TAB */}
        {activeTab === 'calipers' && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Brake Caliper Finish
              </div>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {config.selectedCaliper.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {vehicle.caliperOptions.map((caliper) => {
                const isSelected = config.selectedCaliper.id === caliper.id;
                return (
                  <button
                    key={caliper.id}
                    onClick={() => setCaliper(caliper)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center space-x-2.5 ${
                      isSelected
                        ? 'border-white bg-white/[0.06]'
                        : 'border-white/[0.08] bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: caliper.hex }}
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium text-neutral-200 truncate">
                        {caliper.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        {caliper.price === 0 ? 'Inc.' : `+$${caliper.price}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERIOR TAB */}
        {activeTab === 'interior' && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Interior Trim & Leather
              </div>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {config.selectedInterior.name}
              </h2>
            </div>

            <div className="space-y-2.5">
              {vehicle.interiorOptions.map((interior) => {
                const isSelected = config.selectedInterior.id === interior.id;
                return (
                  <button
                    key={interior.id}
                    onClick={() => setInterior(interior)}
                    className={`w-full p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-white bg-white/[0.06]'
                        : 'border-white/[0.08] bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-1.5">
                        <div
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: interior.hex }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: interior.accentHex }}
                        />
                      </div>
                      <div className="text-xs font-medium text-neutral-200">
                        {interior.name}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-neutral-300">
                      {interior.price === 0 ? 'Included' : `+$${interior.price.toLocaleString()}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY / SPECS TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                Technical Specifications
              </div>
              <h2 className="text-lg font-medium text-white mt-0.5">
                {vehicle.brand} {vehicle.name}
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">0-100 km/h</span>
                <span className="text-white font-medium">{vehicle.specs.acceleration}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">Top Speed</span>
                <span className="text-white font-medium">{vehicle.specs.topSpeed}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">Output</span>
                <span className="text-white font-medium">{vehicle.specs.horsepower}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">Powertrain</span>
                <span className="text-white font-medium truncate max-w-[170px] text-right">
                  {vehicle.specs.powertrain}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">Drivetrain</span>
                <span className="text-white font-medium truncate max-w-[170px] text-right">
                  {vehicle.specs.drivetrain}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-black/30 flex justify-between items-center">
                <span className="text-neutral-400">Curb Weight</span>
                <span className="text-white font-medium">{vehicle.specs.weight}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Fixed Pricing Breakdown */}
      <div className="p-5 border-t border-white/[0.08] bg-[#090a0d] space-y-3">
        <div className="space-y-1.5 text-xs font-mono text-neutral-400">
          <div className="flex justify-between">
            <span>Base Vehicle MSRP</span>
            <span>${vehicle.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Custom Finishes & Options</span>
            <span>
              +$
              {(
                config.selectedPaint.price +
                config.selectedWheel.price +
                config.selectedInterior.price +
                config.selectedCaliper.price
              ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/[0.08]" />

        <div className="flex justify-between items-baseline">
          <span className="text-xs font-mono uppercase text-neutral-400">Total Price</span>
          <span className="text-xl font-mono font-bold text-white">
            ${config.calculatedPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </aside>
  );
};

