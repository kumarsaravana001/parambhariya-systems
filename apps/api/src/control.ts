import type { Zone, ZoneStatus, AlertMetric, AlertSeverity } from "@parambhariya/types";

/**
 * Temperature/environment control plane.
 *
 * The backend holds a SETPOINT per zone and drives the measured value toward
 * it each tick (proportional controller + small process noise). This is the
 * control loop a real edge actuator would run; `stepZone` is the simulation
 * driver and is the single seam where a hardware driver would replace it.
 *
 * Pure functions → unit-testable without a DB or timers.
 */

export interface ZoneReadingState {
  tempC: number;
  rhPct: number;
  co2Ppm: number;
  lightLux: number;
}

/** Deterministic pseudo-noise from a seed so tests are stable. */
function noise(seed: number, amp: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return ((x - Math.floor(x)) - 0.5) * 2 * amp;
}

/** Proportional approach toward target with bounded process noise. */
function approach(current: number, target: number, gain: number, noiseAmp: number, seed: number): number {
  const next = current + (target - current) * gain + noise(seed, noiseAmp);
  return Math.round(next * 100) / 100;
}

/**
 * Advance a zone one control tick. `prev` may be null on first run (cold start)
 * — we then start a little off-setpoint so the approach is visible.
 */
export function stepZone(
  zone: Pick<Zone, "setpointTempC" | "setpointRhPct" | "setpointCo2Ppm">,
  prev: ZoneReadingState | null,
  tick: number,
): ZoneReadingState {
  const start: ZoneReadingState = prev ?? {
    tempC: zone.setpointTempC + 2.5,
    rhPct: zone.setpointRhPct - 4,
    co2Ppm: zone.setpointCo2Ppm + 350,
    lightLux: 120,
  };
  return {
    tempC: approach(start.tempC, zone.setpointTempC, 0.25, 0.15, tick + 1),
    rhPct: approach(start.rhPct, zone.setpointRhPct, 0.3, 0.5, tick + 2),
    co2Ppm: Math.max(350, approach(start.co2Ppm, zone.setpointCo2Ppm, 0.2, 25, tick + 3)),
    lightLux: Math.max(0, approach(start.lightLux, 150, 0.4, 8, tick + 4)),
  };
}

/* ── Alert evaluation ───────────────────────────────────────── */

export interface AlertCandidate {
  metric: AlertMetric;
  severity: AlertSeverity;
  value: string;
  threshold: string;
}

const TEMP_WARN = 2, TEMP_CRIT = 4;   // °C deviation from setpoint
const RH_WARN = 5, RH_CRIT = 10;      // % deviation
const CO2_WARN = 400, CO2_CRIT = 800; // ppm above setpoint

export function evaluateAlerts(
  zone: Pick<Zone, "setpointTempC" | "setpointRhPct" | "setpointCo2Ppm">,
  r: ZoneReadingState,
): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const dTemp = Math.abs(r.tempC - zone.setpointTempC);
  if (dTemp >= TEMP_CRIT) out.push({ metric: "temp", severity: "critical", value: `${r.tempC.toFixed(1)} °C`, threshold: `±${TEMP_CRIT} °C of ${zone.setpointTempC} °C` });
  else if (dTemp >= TEMP_WARN) out.push({ metric: "temp", severity: "warn", value: `${r.tempC.toFixed(1)} °C`, threshold: `±${TEMP_WARN} °C of ${zone.setpointTempC} °C` });

  const dRh = Math.abs(r.rhPct - zone.setpointRhPct);
  if (dRh >= RH_CRIT) out.push({ metric: "rh", severity: "critical", value: `${r.rhPct.toFixed(1)} %`, threshold: `±${RH_CRIT} % of ${zone.setpointRhPct} %` });
  else if (dRh >= RH_WARN) out.push({ metric: "rh", severity: "warn", value: `${r.rhPct.toFixed(1)} %`, threshold: `±${RH_WARN} % of ${zone.setpointRhPct} %` });

  const dCo2 = r.co2Ppm - zone.setpointCo2Ppm;
  if (dCo2 >= CO2_CRIT) out.push({ metric: "co2", severity: "critical", value: `${Math.round(r.co2Ppm)} ppm`, threshold: `≤ ${zone.setpointCo2Ppm + CO2_CRIT} ppm` });
  else if (dCo2 >= CO2_WARN) out.push({ metric: "co2", severity: "warn", value: `${Math.round(r.co2Ppm)} ppm`, threshold: `≤ ${zone.setpointCo2Ppm + CO2_WARN} ppm` });

  return out;
}

export function statusFromAlerts(candidates: AlertCandidate[]): ZoneStatus {
  if (candidates.some((c) => c.severity === "critical")) return "ALARM";
  if (candidates.length > 0) return "WARN";
  return "OK";
}
