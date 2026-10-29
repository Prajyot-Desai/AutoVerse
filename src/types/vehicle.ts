export type PaintFinish = 'gloss' | 'metallic' | 'matte' | 'satin';

export interface PaintOption {
  id: string;
  name: string;
  hex: string;
  finish: PaintFinish;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  price: number;
}

export interface WheelOption {
  id: string;
  name: string;
  finish: string;
  colorHex: string;
  roughness: number;
  metalness: number;
  price: number;
}

export interface InteriorOption {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
  price: number;
}

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
  price: number;
}

export interface VehicleSpecs {
  acceleration: string; // e.g. "3.0s (0-100 km/h)"
  topSpeed: string;     // e.g. "325 km/h"
  horsepower: string;   // e.g. "562 HP"
  powertrain: string;   // e.g. "4.5L Naturally Aspirated V8"
  drivetrain: string;   // e.g. "RWD / 7-Speed Dual-Clutch"
  weight: string;       // e.g. "1,380 kg"
  fuelEconomy: string;  // e.g. "10.9 L/100 km (~585 km range)"
}

export interface MeshBindings {
  bodyMaterials: string[];
  secondaryBodyMaterials?: string[];
  caliperMaterials?: string[];
  interiorMaterials?: string[];
  seatMaterials?: string[];
  stitchingMaterials?: string[];
  wheelMaterials?: string[];
}

export interface Vehicle {
  id: string;
  brand: string;
  name: string;
  edition: string;
  category: 'Supercar' | 'Grand Tourer' | 'Hyper-EV';
  year: number;
  basePrice: number;
  modelPath: string;
  targetLength: number;
  rotationY: number;
  manualScale?: number;
  manualYOffset?: number;
  specs: VehicleSpecs;
  paintOptions: PaintOption[];
  wheelOptions: WheelOption[];
  interiorOptions: InteriorOption[];
  caliperOptions: CaliperOption[];
  meshBindings: MeshBindings;
}

