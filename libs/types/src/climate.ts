/**
 * Stage-appropriate climate profiles.
 *
 * A growing room serves ONE setpoint, but mushrooms need very different climates
 * across their life: colonization wants warmth, darkness and CO₂-tolerance;
 * pinning wants a cool/fresh-air shock with light; fruiting wants steady fresh
 * air and high humidity. The single most common yield bug on a small farm is a
 * zone left on a colonization setpoint while the crop has moved to fruiting —
 * the mycelium grew but won't pin because CO₂ never dropped.
 *
 * This module is the reference library of stage targets, a way to anchor them to
 * a specific strain's optima, and a fit-checker that flags when a zone's current
 * setpoints don't match the stage its crop is actually in. Pure + tested;
 * shared by api and web.
 */

import type { LifecycleStage, RoomPurpose, Strain } from "./index";

export type CultivationStage = "colonization" | "pinning" | "fruiting";

export const CULTIVATION_STAGE_ORDER: CultivationStage[] = ["colonization", "pinning", "fruiting"];

export interface StageTarget {
  stage: CultivationStage;
  label: string;
  tempC: number;
  rhPct: number;
  co2Ppm: number;
  lightLux: number;
  /** one-line operating intent */
  summary: string;
  /** why this climate — the biology */
  why: string;
}

/**
 * Oyster-calibrated reference targets (Pleurotus). These are the fallback when a
 * strain has no usable optima; `stageTargetForStrain` adjusts temp/RH to the
 * actual strain. CO₂ and light come from here — the Strain schema doesn't carry
 * stage-specific values for them.
 */
export const STAGE_CLIMATE: Record<CultivationStage, StageTarget> = {
  colonization: {
    stage: "colonization",
    label: "Colonization",
    tempC: 24,
    rhPct: 85,
    co2Ppm: 5000,
    lightLux: 0,
    summary: "Warm · dark · CO₂-tolerant — let the mycelium run.",
    why: "Mycelium colonizes fastest near the strain optimum and is unbothered by high CO₂. No fresh-air exchange needed, so hold it sealed and warm.",
  },
  pinning: {
    stage: "pinning",
    label: "Pinning",
    tempC: 18,
    rhPct: 95,
    co2Ppm: 700,
    lightLux: 500,
    summary: "Cool shock · fresh air · light — trigger primordia.",
    why: "A drop in temperature and CO₂ plus light and near-saturated air is the signal to switch from vegetative growth to forming pins. Skipping this is why fully-colonized blocks 'just sit there'.",
  },
  fruiting: {
    stage: "fruiting",
    label: "Fruiting",
    tempC: 20,
    rhPct: 88,
    co2Ppm: 800,
    lightLux: 700,
    summary: "Fresh air · high RH · light — grow the flush.",
    why: "Fruit bodies need steady fresh air (low CO₂ keeps stems short and caps wide), high humidity to avoid drying, and light to shape and colour. High CO₂ here gives long stems and tiny caps.",
  },
};

/** Map a room's declared purpose to the cultivation stage it serves. */
export function purposeToStage(purpose: RoomPurpose): CultivationStage | null {
  switch (purpose) {
    case "Colonization": return "colonization";
    case "Pinning": return "pinning";
    case "Fruiting": return "fruiting";
    default: return null; // Storage
  }
}

/** Map a bag's lifecycle stage to the climate stage its crop currently needs. */
export function bagStageToCultivation(stage: LifecycleStage): CultivationStage | null {
  switch (stage) {
    case "COLONIZING": return "colonization";
    case "PINNING": return "pinning";
    case "FRUITING": return "fruiting";
    default: return null; // CREATED / HARVESTED / CONTAMINATED / DISPOSED
  }
}

// Temperature offsets from the strain's colonization optimum (°C). Pinning is a
// deliberate cool-shock; fruiting holds slightly above pinning.
const PIN_TEMP_DROP = 4;
const FRUIT_TEMP_DROP = 2;

/**
 * Anchor a stage target to a specific strain. Temperature and humidity follow
 * the strain's own optima (colonization = its optimal band); CO₂/light stay from
 * the reference profile. Falls back to STAGE_CLIMATE when the strain lacks usable
 * numbers.
 */
export function stageTargetForStrain(strain: Strain | undefined, stage: CultivationStage): StageTarget {
  const ref = STAGE_CLIMATE[stage];
  if (!strain || !(strain.optimalTempMax > strain.optimalTempMin)) return ref;

  const colonizeTemp = (strain.optimalTempMin + strain.optimalTempMax) / 2;
  const rhMid = strain.optimalRhMax > strain.optimalRhMin
    ? (strain.optimalRhMin + strain.optimalRhMax) / 2
    : ref.rhPct;

  let tempC = colonizeTemp;
  let rhPct = rhMid;
  if (stage === "pinning") { tempC = colonizeTemp - PIN_TEMP_DROP; rhPct = Math.min(98, rhMid + 7); }
  else if (stage === "fruiting") { tempC = colonizeTemp - FRUIT_TEMP_DROP; rhPct = Math.min(95, rhMid + 3); }

  return {
    ...ref,
    tempC: Math.round(tempC * 10) / 10,
    rhPct: Math.round(rhPct),
  };
}

/** The setpoints a zone should hold for a target (what "Apply profile" writes). */
export function setpointsForTarget(t: StageTarget): { setpointTempC: number; setpointRhPct: number; setpointCo2Ppm: number } {
  // The control loop's CO₂ slider tops out at 2000 ppm; colonization is
  // effectively "as high as it goes" (no fresh-air exchange).
  return {
    setpointTempC: t.tempC,
    setpointRhPct: t.rhPct,
    setpointCo2Ppm: Math.min(2000, t.co2Ppm),
  };
}

/* ── Fit check: do current setpoints match the stage the crop is in? ── */

export type FitVerdict = "ok" | "warn" | "off";

export interface MetricFit {
  metric: "temp" | "rh" | "co2";
  current: number;
  target: number;
  delta: number;       // current − target (signed)
  verdict: FitVerdict;
  message: string;
}

export interface ClimateFit {
  worst: FitVerdict;
  metrics: MetricFit[];
}

function worstOf(a: FitVerdict, b: FitVerdict): FitVerdict {
  const rank = { ok: 0, warn: 1, off: 2 } as const;
  return rank[a] >= rank[b] ? a : b;
}

/**
 * Compare a zone's current setpoints against a stage target. Temperature and
 * humidity use symmetric bands; CO₂ is directional — being far ABOVE a low
 * fruiting/pinning target is the dangerous case (stuck in colonization air),
 * while sitting below a high colonization target is harmless.
 */
export function climateFit(
  setpoints: { setpointTempC: number; setpointRhPct: number; setpointCo2Ppm: number },
  target: StageTarget,
): ClimateFit {
  const metrics: MetricFit[] = [];

  const dT = setpoints.setpointTempC - target.tempC;
  metrics.push({
    metric: "temp", current: setpoints.setpointTempC, target: target.tempC, delta: Math.round(dT * 10) / 10,
    verdict: Math.abs(dT) <= 1.5 ? "ok" : Math.abs(dT) <= 3 ? "warn" : "off",
    message: Math.abs(dT) <= 1.5 ? "on target" : `${dT > 0 ? "+" : ""}${Math.round(dT * 10) / 10} °C vs ${target.label.toLowerCase()} target`,
  });

  const dH = setpoints.setpointRhPct - target.rhPct;
  metrics.push({
    metric: "rh", current: setpoints.setpointRhPct, target: target.rhPct, delta: Math.round(dH),
    verdict: Math.abs(dH) <= 5 ? "ok" : Math.abs(dH) <= 10 ? "warn" : "off",
    message: Math.abs(dH) <= 5 ? "on target" : `${dH > 0 ? "+" : ""}${Math.round(dH)} % vs ${target.label.toLowerCase()} target`,
  });

  // CO₂: only an ABOVE-target excess matters (stale air at fruiting/pinning).
  const co2Cap = Math.min(2000, target.co2Ppm);
  const dC = setpoints.setpointCo2Ppm - co2Cap;
  let co2Verdict: FitVerdict = "ok";
  let co2Msg = "on target";
  if (dC > 600) { co2Verdict = "off"; co2Msg = `+${Math.round(dC)} ppm — too high for ${target.label.toLowerCase()} (needs fresh air)`; }
  else if (dC > 250) { co2Verdict = "warn"; co2Msg = `+${Math.round(dC)} ppm above ${target.label.toLowerCase()} target`; }
  metrics.push({ metric: "co2", current: setpoints.setpointCo2Ppm, target: co2Cap, delta: Math.round(dC), verdict: co2Verdict, message: co2Msg });

  return { worst: metrics.reduce<FitVerdict>((w, m) => worstOf(w, m.verdict), "ok"), metrics };
}

/** Dominant cultivation stage among a set of bag lifecycle stages (the crop's "centre of mass"). */
export function dominantCropStage(bagStages: LifecycleStage[]): CultivationStage | null {
  const tally = new Map<CultivationStage, number>();
  for (const s of bagStages) {
    const cs = bagStageToCultivation(s);
    if (cs) tally.set(cs, (tally.get(cs) ?? 0) + 1);
  }
  let best: CultivationStage | null = null;
  let bestN = 0;
  for (const stage of CULTIVATION_STAGE_ORDER) {
    const n = tally.get(stage) ?? 0;
    if (n > bestN) { best = stage; bestN = n; }
  }
  return best;
}
