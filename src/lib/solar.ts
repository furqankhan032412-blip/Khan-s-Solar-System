import type { EstimateInput, EstimateResult } from '../types';

const PANEL_WATTS = 550;
const PANEL_AREA_SQFT = 27;
const PEAK_SUN_HOURS = 5;
const STANDARD_INVERTERS = [5, 10, 12, 15, 20, 25, 30];

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const dailyEnergyKwh = input.monthlyBillKwh / 30;
  const rawSystemSizeKw = dailyEnergyKwh / PEAK_SUN_HOURS;
  const maxPanelsSupported = Math.max(1, Math.floor(input.availableRoofAreaSqFt / PANEL_AREA_SQFT));
  const requiredPanels = Math.max(1, Math.ceil((rawSystemSizeKw * 1000) / PANEL_WATTS));
  const panelCount = Math.min(requiredPanels, maxPanelsSupported);
  const actualSystemSizeKw = roundKw((panelCount * PANEL_WATTS) / 1000);
  const roofMaxSystemSizeKw = roundKw((maxPanelsSupported * PANEL_WATTS) / 1000);
  const inverterSizeKw = STANDARD_INVERTERS.find((size) => size >= actualSystemSizeKw) ?? 30;
  const annualProductionKwh = actualSystemSizeKw * PEAK_SUN_HOURS * 365;
  const baseTariffRate = input.propertyType === 'commercial' ? 64 : 52;
  const estimatedProjectCost = Math.round(actualSystemSizeKw * (input.propertyType === 'commercial' ? 142000 : 156000));
  let cumulativeSavings = 0;

  const forecast = Array.from({ length: 10 }, (_, index) => {
    const year = index + 1;
    const tariffRate = Number((baseTariffRate * 1.1 ** index).toFixed(3));
    const annualSavings = Math.round(annualProductionKwh * tariffRate);
    cumulativeSavings += annualSavings;

    return {
      year,
      tariffRate,
      annualSavings,
      cumulativeSavings
    };
  });

  return {
    ...input,
    recommendedSystemSizeKw: actualSystemSizeKw,
    roofMaxSystemSizeKw,
    annualProductionKwh: Math.round(annualProductionKwh),
    panelCount,
    maxPanelsSupported,
    inverterSizeKw,
    rackConfiguration:
      input.propertyType === 'commercial'
        ? 'Ballasted aluminum rail blocks with wind deflectors'
        : 'Flush-mount anodized rails with stainless clamps',
    batteryRecommendationKwh: Math.ceil(actualSystemSizeKw * 1.6),
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
