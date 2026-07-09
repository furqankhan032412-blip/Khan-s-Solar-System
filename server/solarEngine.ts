export type PropertyType = 'residential' | 'commercial';

export type EstimateRequest = {
  monthlyBillKwh: number;
  availableRoofAreaSqFt: number;
  propertyType?: PropertyType;
};

export type SavingsPoint = {
  year: number;
  tariffRate: number;
  annualSavings: number;
  cumulativeSavings: number;
};

export type EstimateResponse = {
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

const PANEL_WATTS = 550;
const PANEL_AREA_SQFT = 27;
const PEAK_SUN_HOURS = 5;
const STANDARD_INVERTERS = [5, 10, 12, 15, 20, 25, 30];

export function calculateSolarEstimate(request: EstimateRequest): EstimateResponse {
  const propertyType = request.propertyType ?? 'residential';
  const dailyEnergyKwh = request.monthlyBillKwh / 30;
  const requestedSystemSizeKw = dailyEnergyKwh / PEAK_SUN_HOURS;
  const maxPanelsSupported = Math.max(1, Math.floor(request.availableRoofAreaSqFt / PANEL_AREA_SQFT));
  const requiredPanels = Math.max(1, Math.ceil((requestedSystemSizeKw * 1000) / PANEL_WATTS));
  const panelCount = Math.min(requiredPanels, maxPanelsSupported);
  const recommendedSystemSizeKw = roundKw((panelCount * PANEL_WATTS) / 1000);
  const roofMaxSystemSizeKw = roundKw((maxPanelsSupported * PANEL_WATTS) / 1000);
  const inverterSizeKw = STANDARD_INVERTERS.find((size) => size >= recommendedSystemSizeKw) ?? 30;
  const annualProductionKwh = recommendedSystemSizeKw * PEAK_SUN_HOURS * 365;
  const baseTariffRate = propertyType === 'commercial' ? 64 : 52;
  const estimatedProjectCost = Math.round(recommendedSystemSizeKw * (propertyType === 'commercial' ? 142000 : 156000));
  let cumulativeSavings = 0;

  const forecast = Array.from({ length: 10 }, (_, index) => {
    const tariffRate = Number((baseTariffRate * 1.1 ** index).toFixed(3));
    const annualSavings = Math.round(annualProductionKwh * tariffRate);
    cumulativeSavings += annualSavings;

    return {
      year: index + 1,
      tariffRate,
      annualSavings,
      cumulativeSavings
    };
  });

  return {
    monthlyBillKwh: request.monthlyBillKwh,
    availableRoofAreaSqFt: request.availableRoofAreaSqFt,
    propertyType,
    recommendedSystemSizeKw,
    roofMaxSystemSizeKw,
    annualProductionKwh: Math.round(annualProductionKwh),
    panelCount,
    maxPanelsSupported,
    inverterSizeKw,
    rackConfiguration:
      propertyType === 'commercial'
        ? 'Ballasted aluminum rail blocks with wind deflectors'
        : 'Flush-mount anodized rails with stainless clamps',
    batteryRecommendationKwh: Math.ceil(recommendedSystemSizeKw * 1.6),
    estimatedProjectCost,
    paybackYears: Number((estimatedProjectCost / Math.max(1, forecast[0]?.annualSavings ?? 1)).toFixed(1)),
    cappedByRoofArea: requiredPanels > maxPanelsSupported,
    materials: {
      panelWattage: PANEL_WATTS,
      solarPanels: panelCount,
      inverter: `${inverterSizeKw}kW hybrid inverter`,
      mountingRailsMeters: Math.ceil(panelCount * 2.2),
      clamps: panelCount * 4,
      dcCableMeters: Math.ceil(panelCount * 6.5),
      combinerBoxes: Math.max(1, Math.ceil(panelCount / 18))
    },
    forecast
  };
}

function roundKw(value: number) {
  return Number(value.toFixed(2));
}
