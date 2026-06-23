/**
 * Climate-aware colonization predictor.
 *
 * Mycelial growth is strongly temperature-dependent: extension rate peaks near
 * the species optimum and slows below it (roughly Q10 ≈ 2 → ~7–8 % slower per
 * °C) and crashes above it (heat stress). We model a multiplier on the *base*
 * colonization time (the time at optimum the grower sets per batch), so the
 * estimate reflects the actual incubation climate.
 *
 * This is an operational estimate, not a lab measurement — surfaced with that
 * caveat in the UI. Pure functions → unit-testable, shared by api and web.
 */

export type ColonizationBand = "optimal" | "slow-cold" | "slow-heat" | "stalled-cold" | "stalled-heat";

export interface ColonizationEstimate {
  factor: number;          // time multiplier (1.0 = at optimum)
  estimatedDays: number;   // base × factor, rounded
  band: ColonizationBand;
  note: string;
}

/** Time multiplier vs the strain's optimal temperature band. */
export function tempTimeFactor(tempC: number, optMin: number, optMax: number): { factor: number; band: ColonizationBand } {
  const mid = (optMin + optMax) / 2;
  if (tempC >= optMin && tempC <= optMax) {
    // within band: marginal slow-down toward the edges
    return { factor: 1 + 0.02 * Math.abs(tempC - mid), band: "optimal" };
  }
  if (tempC < optMin) {
    const below = optMin - tempC;
    if (tempC <= optMin - 12) return { factor: 4 + 0.15 * (optMin - 12 - tempC), band: "stalled-cold" };
    return { factor: 1 + 0.08 * below, band: "slow-cold" };
  }
  // above band
  const above = tempC - optMax;
  if (tempC >= optMax + 8) return { factor: 4 + 0.25 * (tempC - (optMax + 8)), band: "stalled-heat" };
  return { factor: 1 + 0.12 * above, band: "slow-heat" };
}

const BAND_NOTE: Record<ColonizationBand, string> = {
  optimal: "Incubating near the optimum — fastest colonization.",
  "slow-cold": "Below optimum — colonization is slower; raise the setpoint to speed it up.",
  "slow-heat": "Above optimum — colonization is slower and heat-stress risk rises.",
  "stalled-cold": "Too cold — growth is nearly stalled. Move to a warmer zone.",
  "stalled-heat": "Too hot — growth stalls and contamination/abortion risk is high. Cool down.",
};

export function estimateColonization(baseDays: number, optMin: number, optMax: number, tempC: number): ColonizationEstimate {
  const { factor, band } = tempTimeFactor(tempC, optMin, optMax);
  return {
    factor: Math.round(factor * 100) / 100,
    estimatedDays: Math.max(1, Math.round(baseDays * factor)),
    band,
    note: BAND_NOTE[band],
  };
}

export interface ColonizationForecast {
  daysElapsed: number;
  daysRemaining: number;
  progress: number;       // 0..1
  readyOn: string;        // YYYY-MM-DD
  isReady: boolean;
}

const DAY = 86400000;
// Treat date-only strings as UTC midnight so the day math is timezone-stable
// (we read back the date via toISOString, which is UTC).
const parse = (s: string) => new Date(s.length <= 10 ? `${s}T00:00:00Z` : s);
const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Project a ready-date + progress from an inoculation date and an estimated duration. */
export function colonizationForecast(inoculatedOn: string, estimatedDays: number, today: string): ColonizationForecast {
  const start = parse(inoculatedOn);
  const now = parse(today);
  const ready = new Date(start.getTime() + estimatedDays * DAY);
  const elapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / DAY));
  const remaining = Math.max(0, Math.ceil((ready.getTime() - now.getTime()) / DAY));
  const progress = estimatedDays > 0 ? Math.max(0, Math.min(1, elapsed / estimatedDays)) : 1;
  return { daysElapsed: elapsed, daysRemaining: remaining, progress, readyOn: ymd(ready), isReady: progress >= 1 };
}
