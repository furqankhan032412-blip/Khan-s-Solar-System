export type PropertyType = 'residential' | 'commercial';
export type Role = 'client' | 'engineer' | 'admin';
export type ThemeMode = 'light' | 'dark';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: Role;
};

export type SavingsPoint = {
  year: number;
  tariffRate: number;
  annualSavings: number;
  cumulativeSavings: number;
};

export type EstimateInput = {
  monthlyBillKwh: number;
  availableRoofAreaSqFt: number;
  propertyType: PropertyType;
};

export type EstimateResult = {
  monthlyBillKwh: number;
  availableRoofAreaSqFt: number;
  propertyType: PropertyType;
  recommendedSystemSizeKw: number;
  roofMaxSystemSizeKw: number;
  annualProductionKwh: number;
  panelCount: number;
  maxPanelsSupported: number;
  inverterSizeKw: number;
  rackConfiguration: string;
  batteryRecommendationKwh: number;
  estimatedProjectCost: number;
  paybackYears: number;
  cappedByRoofArea: boolean;
  materials: {
    panelWattage: number;
    solarPanels: number;
    inverter: string;
    mountingRailsMeters: number;
    clamps: number;
    dcCableMeters: number;
    combinerBoxes: number;
  };
  forecast: SavingsPoint[];
};

export type PipelinePhase =
  | 'Lead / Simulation Generated'
  | 'Site Inspection & Structural Verification'
  | 'Material Allocation & Hardware Procurement'
  | 'On-Site Installation & Electrical Wiring'
  | 'Net-Metering Integration & Final Testing';

export type Project = {
  id: string;
  clientName: string;
  address: string;
  phase: PipelinePhase;
  systemSizeKw: number;
  assignedTo: string;
  value: number;
  progress: number;
  priority: 'Standard' | 'High' | 'Critical';
  dueDate: string;
  materialsReady: number;
};
