import { PaintOption, WheelOption, InteriorOption, CaliperOption } from './vehicle';

export type ConfiguratorTab = 'exterior' | 'wheels' | 'calipers' | 'interior' | 'details' | 'summary';

export type CameraViewPreset = 'front' | 'side' | 'rear' | 'three-quarter' | 'interior' | 'top';

export interface VehicleConfiguration {
  vehicleId: string;
  selectedPaint: PaintOption;
  selectedWheel: WheelOption;
  selectedInterior: InteriorOption;
  selectedCaliper: CaliperOption;
  headlightsOn: boolean;
  doorsOpen: boolean;
  activePreset: CameraViewPreset;
  calculatedPrice: number;
}
