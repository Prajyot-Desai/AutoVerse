import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';
import { CameraViewPreset } from '../../types/configurator';
import { CarModel } from './CarModel';
import { ShowroomEnvironment } from './ShowroomEnvironment';
import { CameraController } from './CameraController';
import { ViewerLoadingOverlay } from './ViewerLoadingOverlay';
import { CarErrorBoundary } from './CarErrorBoundary';
import { RotateCw, RotateCcw, Eye } from 'lucide-react';

const VEHICLE_BAY_POSITIONS: Record<string, [number, number, number]> = {
  'ferrari-f40': [-7.5, 0.08, 0],
  'porsche-718': [0, 0.08, 0],
  'bmw-i8': [7.5, 0.08, 0],
};

export const ViewerPlaceholder: React.FC = () => {
  const {
    vehicles,
    configurations,
    getActiveVehicle,
    getActiveConfig,
    cameraPreset,
    setCameraPreset,
    isRotating,
    toggleRotate,
  } = useConfiguratorStore();

  const vehicle = getActiveVehicle();
  const config = getActiveConfig();

  // Active bay position on horizontal X-axis
  const activeBayX = useMemo(() => {
    return VEHICLE_BAY_POSITIONS[vehicle.id]?.[0] ?? 0;
  }, [vehicle.id]);

  // Local signal state to force camera reset
  const [resetSignal, setResetSignal] = useState(0);

  const handleResetView = useCallback(() => {
    setCameraPreset('three-quarter');
    setResetSignal((s) => s + 1);
  }, [setCameraPreset]);

  const cameraPresets: { id: CameraViewPreset; label: string }[] = [
    { id: 'three-quarter', label: '3/4 Perspective' },
    { id: 'front', label: 'Front' },
    { id: 'side', label: 'Profile' },
    { id: 'rear', label: 'Rear' },
    { id: 'top', label: 'Top' },
  ];

  return (
    <div className="relative flex-1 h-full w-full bg-[#07080c] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <CarErrorBoundary>
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          camera={{ position: [activeBayX + 4.8, 1.8, 4.8], fov: 42, near: 0.1, far: 120 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#07080c']} />
          <fog attach="fog" args={['#07080c', 16, 42]} />

          {/* Showroom Architectural Pavilion Environment (Ceiling hidden in Top view) */}
          <ShowroomEnvironment
            activeBayX={activeBayX}
            hideCeiling={cameraPreset === 'top'}
          />

          {/* Render All Three Vehicle Models in their Respective Showroom Bays */}
          <Suspense fallback={null}>
            {vehicles.map((v) => {
              const bayPos = VEHICLE_BAY_POSITIONS[v.id] || [0, 0.08, 0];
              const vConfig = configurations[v.id] || config;
              return (
                <CarModel
                  key={v.id}
                  vehicle={v}
                  config={vConfig}
                  platformPosition={bayPos}
                  isRotating={isRotating}
                  resetSignal={resetSignal}
                />
              );
            })}
          </Suspense>

          {/* Camera Controller Framing Active Vehicle */}
          <CameraController
            preset={cameraPreset}
            resetSignal={resetSignal}
            activeBayX={activeBayX}
          />
        </Canvas>
      </CarErrorBoundary>

      {/* Streaming Geometry & Texture Loading Progress */}
      <ViewerLoadingOverlay vehicleName={`${vehicle.brand} ${vehicle.name}`} />

      {/* Top Overlay: Vehicle Identity */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            {vehicle.brand} / {vehicle.year}
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-neutral-300">
            {vehicle.category}
          </span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white mt-1 drop-shadow-sm">
          {vehicle.name}
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          {vehicle.edition}
        </p>
      </div>

      {/* Bottom Overlay: Controls Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        {/* Camera Angle Presets */}
        <div className="flex items-center space-x-1.5 bg-[#101217]/90 backdrop-blur-md border border-white/[0.08] p-1 rounded-lg pointer-events-auto shadow-lg">
          <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-neutral-400" />
            <span>Preset</span>
          </div>
          {cameraPresets.map((preset) => {
            const isActive = cameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setCameraPreset(preset.id)}
                className={`px-2.5 py-1 text-xs rounded transition-all duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white font-medium border border-white/10 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Viewport & Camera Actions */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Reset Camera View Button */}
          <button
            onClick={handleResetView}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg border bg-[#101217]/90 backdrop-blur-md text-neutral-300 border-white/[0.08] hover:text-white hover:border-white/20 transition-colors shadow-lg"
            title="Reset camera framing and orbit target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>

          {/* Turntable Auto-Rotate Button */}
          <button
            onClick={toggleRotate}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg border backdrop-blur-md transition-all duration-150 shadow-lg ${
              isRotating
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-[#101217]/90 text-neutral-400 border-white/[0.08] hover:text-white hover:border-white/20'
            }`}
            title="Toggle continuous turntable rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Turntable</span>
          </button>
        </div>
      </div>
    </div>
  );
};
