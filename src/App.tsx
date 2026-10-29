import React from 'react';
import { Header } from './components/layout/Header';
import { ViewerPlaceholder } from './components/3d/ViewerPlaceholder';
import { ConfiguratorPanel } from './components/configurator/ConfiguratorPanel';
import { ComparisonModal } from './components/comparison/ComparisonModal';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090c] text-neutral-100 overflow-hidden font-sans">
      {/* Brand Navigation & Quick Controls */}
      <Header />

      {/* Main Studio Work Area */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* 3D Viewport / Staging Area */}
        <ViewerPlaceholder />

        {/* Configuration Palette & Specification Controls */}
        <ConfiguratorPanel />
      </main>

      {/* Comparison Modal */}
      <ComparisonModal />
    </div>
  );
};

export default App;

