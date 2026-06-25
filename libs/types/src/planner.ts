/**
 * Backward production planner.
 *
 * A buyer asks for N units of a product by a date. The grower needs to know the
 * LAST safe day to start each step of the spawn ladder so the biology lands on
 * time — and whether it's even feasible. This walks the passage chain backward
 * from the delivery date, subtracting each stage's CLIMATE-ADJUSTED colonization
 * time (warmer = faster, colder = slower — same model as the forecast), and
 * propagates the quantity upstream through per-stage multiplication ratios.
 *
 * Pure + tested; shared by api and web. Operational estimate, not a guarantee.
 */

import type { SpawnStage } from "./index";
import { SPAWN_STAGE_ORDER, SPAWN_STAGE_LABEL, SPAWN_STAGE_BASE_DAYS } from "./index";
import { estimateColonization } from "./colonization";

/**
 * Units of a stage produced from ONE unit of its immediate parent (a grower can
 * override per batch). Conservative oyster-ish defaults: a liquid culture seeds
 * ~10 grain jars; grain-to-grain ~5×; a master spawn bag stuffs ~10 substrate
 * blocks. MC/LC/master are 1:1 placeholders (they're transfer points, not where
 * the big multiplication happens).
 */
export const STAGE_EXPANSION: Record<SpawnStage, number> = {
  MOTHER_CULTURE: 1,
  LIQUID_CULTURE: 1,
  GRAIN_G1: 10,
  GRAIN_G2: 5,
  SPAWN_MASTER: 1,
  SUBSTRATE_F1: 10,
};

export interface PlanStage {
  stage: SpawnStage;
  label: string;
  days: number;        // climate-adjusted duration of this stage
  startBy: string;     // YYYY-MM-DD — inoculate this stage no later than
  readyBy: string;     // YYYY-MM-DD — colonized / ready to transfer
  unitsNeeded: number; // how many of THIS stage you must produce
  late: boolean;       // startBy is already in the past
}

export interface BackwardPlan {
  stages: PlanStage[];      // chronological: first stage to start → final product
  inoculateFirstBy: string; // the very first "must start by" date
  feasible: boolean;        // first start date is today or later
  slackDays: number;        // days from today to the first start (negative = behind schedule)
  totalDays: number;        // sum of stage durations along the chain
}

const DAY = 86400000;
// Treat date-only strings as UTC midnight so the math is timezone-stable.
const parse = (s: string) => new Date(s.length <= 10 ? `${s}T00:00:00Z` : s);
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => ymd(new Date(parse(s).getTime() + n * DAY));
const diffDays = (a: string, b: string) => Math.round((parse(a).getTime() - parse(b).getTime()) / DAY);

export interface BackwardPlanOpts {
  finalStage: SpawnStage;
  targetUnits: number;
  targetReadyOn: string;   // delivery / ready date (YYYY-MM-DD)
  today: string;           // YYYY-MM-DD
  optMin: number;          // strain optimal temp band
  optMax: number;
  tempC: number;           // incubation temperature (live reading / setpoint / optimum)
  startStage?: SpawnStage; // default MOTHER_CULTURE
  expansion?: Partial<Record<SpawnStage, number>>;
  baseDays?: Partial<Record<SpawnStage, number>>;
}

/**
 * Build a backward schedule from a delivery target. Returns one row per stage in
 * the chain (start → final), each with the latest safe inoculation date and the
 * quantity required, plus overall feasibility against `today`.
 */
export function backwardPlan(opts: BackwardPlanOpts): BackwardPlan {
  const startStage = opts.startStage ?? "MOTHER_CULTURE";
  const startIdx = SPAWN_STAGE_ORDER.indexOf(startStage);
  const finalIdx = SPAWN_STAGE_ORDER.indexOf(opts.finalStage);
  // chain of stages from start..final inclusive (defensive: clamp + order)
  const lo = Math.min(startIdx, finalIdx);
  const hi = Math.max(startIdx, finalIdx);
  const chain = SPAWN_STAGE_ORDER.slice(lo, hi + 1);

  const dur = (stage: SpawnStage) => {
    const base = opts.baseDays?.[stage] ?? SPAWN_STAGE_BASE_DAYS[stage];
    return estimateColonization(base, opts.optMin, opts.optMax, opts.tempC).estimatedDays;
  };
  const exp = (stage: SpawnStage) => Math.max(1, opts.expansion?.[stage] ?? STAGE_EXPANSION[stage]);

  // Walk backward from the final stage to compute dates + quantities.
  const rev: PlanStage[] = [];
  let readyBy = opts.targetReadyOn;
  let unitsForThis = Math.max(1, Math.ceil(opts.targetUnits));
  for (let i = chain.length - 1; i >= 0; i--) {
    const stage = chain[i]!;
    const days = dur(stage);
    const startBy = addDays(readyBy, -days);
    rev.push({
      stage,
      label: SPAWN_STAGE_LABEL[stage],
      days,
      startBy,
      readyBy,
      unitsNeeded: unitsForThis,
      late: diffDays(startBy, opts.today) < 0,
    });
    // the parent must be READY by the time this stage starts; size it up by the ratio
    readyBy = startBy;
    unitsForThis = Math.max(1, Math.ceil(unitsForThis / exp(stage)));
  }

  const stages = rev.reverse(); // chronological
  const inoculateFirstBy = stages[0]?.startBy ?? opts.targetReadyOn;
  const slackDays = diffDays(inoculateFirstBy, opts.today);
  const totalDays = stages.reduce((n, s) => n + s.days, 0);

  return { stages, inoculateFirstBy, feasible: slackDays >= 0, slackDays, totalDays };
}
