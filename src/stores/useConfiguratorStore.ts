import { create } from 'zustand';
import { VEHICLES } from '../data/vehicles';
import { Vehicle, PaintOption, WheelOption, InteriorOption, CaliperOption } from '../types/vehicle';
import { ConfiguratorTab, CameraViewPreset, VehicleConfiguration } from '../types/configurator';

interface ConfiguratorStore {
  vehicles: Vehicle[];
  activeVehicleId: string;
  configurations: Record<string, VehicleConfiguration>;
  activeTab: ConfiguratorTab;
  cameraPreset: CameraViewPreset;
  isRotating: boolean;
  isWireframe: boolean;
  isExploring: boolean;
  environmentPreset: 'studio' | 'night' | 'sunset' | 'neutral';
  comparisonVehicleId: string | null;
  isComparisonOpen: boolean;

  // Actions
  getActiveVehicle: () => Vehicle;
  getActiveConfig: () => VehicleConfiguration;
  setActiveVehicle: (id: string) => void;
  setPaint: (paint: PaintOption) => void;
  setWheel: (wheel: WheelOption) => void;
  setInterior: (interior: InteriorOption) => void;
  setCaliper: (caliper: CaliperOption) => void;
  setActiveTab: (tab: ConfiguratorTab) => void;
  setCameraPreset: (preset: CameraViewPreset) => void;
  setIsExploring: (isExploring: boolean) => void;
  toggleExploring: () => void;
  toggleRotate: () => void;
  toggleHeadlights: () => void;
  toggleDoors: () => void;
  setEnvironmentPreset: (env: 'studio' | 'night' | 'sunset' | 'neutral') => void;
  setComparisonVehicleId: (id: string | null) => void;
  setIsComparisonOpen: (open: boolean) => void;
  resetCurrentConfig: () => void;
}

const buildDefaultConfig = (v: Vehicle): VehicleConfiguration => {
  const selectedPaint = v.paintOptions[0];
  const selectedWheel = v.wheelOptions[0];
  const selectedInterior = v.interiorOptions[0];
  const selectedCaliper = v.caliperOptions[0];
  const calculatedPrice = v.basePrice + selectedPaint.price + selectedWheel.price + selectedInterior.price + selectedCaliper.price;

  return {
    vehicleId: v.id,
    selectedPaint,
    selectedWheel,
    selectedInterior,
    selectedCaliper,
    headlightsOn: true,
    doorsOpen: false,
    activePreset: 'three-quarter',
    calculatedPrice,
  };
};

const initialConfigurations: Record<string, VehicleConfiguration> = {};
VEHICLES.forEach((v) => {
  initialConfigurations[v.id] = buildDefaultConfig(v);
});

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  vehicles: VEHICLES,
  activeVehicleId: VEHICLES[0].id,
  configurations: initialConfigurations,
  activeTab: 'exterior',
  cameraPreset: 'three-quarter',
  isRotating: false,
  isWireframe: false,
  isExploring: false,
  environmentPreset: 'studio',
  comparisonVehicleId: null,
  isComparisonOpen: false,

  getActiveVehicle: () => {
    const { vehicles, activeVehicleId } = get();
    return vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  },

  getActiveConfig: () => {
    const { configurations, activeVehicleId } = get();
    return configurations[activeVehicleId] || initialConfigurations[activeVehicleId];
  },

  setActiveVehicle: (id: string) => {
    set({ activeVehicleId: id });
  },

  setPaint: (paint: PaintOption) => {
    const { activeVehicleId, configurations, getActiveVehicle } = get();
    const curr = configurations[activeVehicleId];
    const vehicle = getActiveVehicle();
    const newPrice =
      vehicle.basePrice +
      paint.price +
      curr.selectedWheel.price +
      curr.selectedInterior.price +
      curr.selectedCaliper.price;

    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          selectedPaint: paint,
          calculatedPrice: newPrice,
        },
      },
    });
  },

  setWheel: (wheel: WheelOption) => {
    const { activeVehicleId, configurations, getActiveVehicle } = get();
    const curr = configurations[activeVehicleId];
    const vehicle = getActiveVehicle();
    const newPrice =
      vehicle.basePrice +
      curr.selectedPaint.price +
      wheel.price +
      curr.selectedInterior.price +
      curr.selectedCaliper.price;

    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          selectedWheel: wheel,
          calculatedPrice: newPrice,
        },
      },
    });
  },

  setInterior: (interior: InteriorOption) => {
    const { activeVehicleId, configurations, getActiveVehicle } = get();
    const curr = configurations[activeVehicleId];
    const vehicle = getActiveVehicle();
    const newPrice =
      vehicle.basePrice +
      curr.selectedPaint.price +
      curr.selectedWheel.price +
      interior.price +
      curr.selectedCaliper.price;

    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          selectedInterior: interior,
          calculatedPrice: newPrice,
        },
      },
    });
  },

  setCaliper: (caliper: CaliperOption) => {
    const { activeVehicleId, configurations, getActiveVehicle } = get();
    const curr = configurations[activeVehicleId];
    const vehicle = getActiveVehicle();
    const newPrice =
      vehicle.basePrice +
      curr.selectedPaint.price +
      curr.selectedWheel.price +
      curr.selectedInterior.price +
      caliper.price;

    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          selectedCaliper: caliper,
          calculatedPrice: newPrice,
        },
      },
    });
  },

  setActiveTab: (tab: ConfiguratorTab) => set({ activeTab: tab }),

  setCameraPreset: (preset: CameraViewPreset) => {
    const { activeVehicleId, configurations } = get();
    const curr = configurations[activeVehicleId];
    set({
      cameraPreset: preset,
      isExploring: false,
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          activePreset: preset,
        },
      },
    });
  },

  setIsExploring: (isExploring: boolean) => set({ isExploring }),

  toggleExploring: () => set((s) => ({ isExploring: !s.isExploring })),

  toggleRotate: () => set((s) => ({ isRotating: !s.isRotating })),

  toggleHeadlights: () => {
    const { activeVehicleId, configurations } = get();
    const curr = configurations[activeVehicleId];
    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          headlightsOn: !curr.headlightsOn,
        },
      },
    });
  },

  toggleDoors: () => {
    const { activeVehicleId, configurations } = get();
    const curr = configurations[activeVehicleId];
    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: {
          ...curr,
          doorsOpen: !curr.doorsOpen,
        },
      },
    });
  },

  setEnvironmentPreset: (env) => set({ environmentPreset: env }),

  setComparisonVehicleId: (id) => set({ comparisonVehicleId: id }),

  setIsComparisonOpen: (open) => set({ isComparisonOpen: open }),

  resetCurrentConfig: () => {
    const { activeVehicleId, getActiveVehicle, configurations } = get();
    const vehicle = getActiveVehicle();
    set({
      configurations: {
        ...configurations,
        [activeVehicleId]: buildDefaultConfig(vehicle),
      },
    });
  },
}));

