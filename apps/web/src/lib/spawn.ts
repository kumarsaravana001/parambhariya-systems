import {
  estimateColonization, colonizationForecast,
  type SpawnBatch, type Strain, type Zone,
} from "@parambhariya/types";

export const todayYMD = () => new Date().toISOString().slice(0, 10);

export interface BatchForecast {
  tempC: number;
  tempBasis: "live" | "setpoint" | "optimum";
  estimate: ReturnType<typeof estimateColonization>;
  forecast: ReturnType<typeof colonizationForecast>;
}

/**
 * Colonization forecast for a spawn batch, using its incubation zone's LIVE
 * temperature when available (else the zone setpoint, else the strain optimum).
 */
export function batchForecast(batch: SpawnBatch, strain?: Strain, zone?: Zone, today = todayYMD()): BatchForecast | null {
  if (!strain || !batch.inoculatedOn) return null;
  let tempC: number;
  let tempBasis: BatchForecast["tempBasis"];
  if (zone?.tempC != null) { tempC = zone.tempC; tempBasis = "live"; }
  else if (zone) { tempC = zone.setpointTempC; tempBasis = "setpoint"; }
  else { tempC = (strain.optimalTempMin + strain.optimalTempMax) / 2; tempBasis = "optimum"; }

  const estimate = estimateColonization(batch.expectedColonizationDays, strain.optimalTempMin, strain.optimalTempMax, tempC);
  const forecast = colonizationForecast(batch.inoculatedOn, estimate.estimatedDays, today);
  return { tempC, tempBasis, estimate, forecast };
}

export const bandTone = (band: string): "success" | "warn" | "danger" | "neutral" => {
  if (band === "optimal") return "success";
  if (band === "slow-cold" || band === "slow-heat") return "warn";
  if (band.startsWith("stalled")) return "danger";
  return "neutral";
};

export const statusTone = (s: SpawnBatch["status"]): "success" | "warn" | "danger" | "neutral" | "info" => {
  switch (s) {
    case "READY": return "success";
    case "COLONIZING": case "INOCULATED": return "info";
    case "SOLD": case "USED": return "neutral";
    case "CONTAMINATED": return "danger";
    default: return "neutral";
  }
};
