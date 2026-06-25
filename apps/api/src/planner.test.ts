import { describe, it, expect } from "vitest";
import { backwardPlan, STAGE_EXPANSION } from "@parambhariya/types";

// Oyster band 22–26 °C; plan at the optimum so durations == base days.
const base = { optMin: 22, optMax: 26, tempC: 24, today: "2026-06-01" };

describe("backwardPlan", () => {
  it("schedules the chain backward so the final stage is ready on the target date", () => {
    const plan = backwardPlan({ ...base, finalStage: "SUBSTRATE_F1", targetUnits: 100, targetReadyOn: "2026-08-01" });
    const final = plan.stages[plan.stages.length - 1]!;
    expect(final.stage).toBe("SUBSTRATE_F1");
    expect(final.readyBy).toBe("2026-08-01");
    // each stage's start is exactly its duration before its ready date
    for (const s of plan.stages) {
      const start = new Date(`${s.startBy}T00:00:00Z`).getTime();
      const ready = new Date(`${s.readyBy}T00:00:00Z`).getTime();
      expect(Math.round((ready - start) / 86400000)).toBe(s.days);
    }
    // stages are chained: each stage's ready date == the next stage's start date
    for (let i = 0; i < plan.stages.length - 1; i++) {
      expect(plan.stages[i]!.readyBy).toBe(plan.stages[i + 1]!.startBy);
    }
  });

  it("propagates quantity upstream through the multiplication ratios", () => {
    const plan = backwardPlan({ ...base, finalStage: "SUBSTRATE_F1", targetUnits: 100, targetReadyOn: "2026-08-01" });
    const byStage = Object.fromEntries(plan.stages.map((s) => [s.stage, s.unitsNeeded]));
    expect(byStage["SUBSTRATE_F1"]).toBe(100);
    // 100 blocks ÷ 10 per master spawn = 10 master spawn
    expect(byStage["SPAWN_MASTER"]).toBe(Math.ceil(100 / STAGE_EXPANSION.SUBSTRATE_F1));
    // upstream counts never increase as you go back toward the mother culture
    for (let i = 0; i < plan.stages.length - 1; i++) {
      expect(plan.stages[i]!.unitsNeeded).toBeLessThanOrEqual(plan.stages[i + 1]!.unitsNeeded);
    }
  });

  it("flags infeasible plans when the first inoculation date is already past", () => {
    const tight = backwardPlan({ ...base, finalStage: "SUBSTRATE_F1", targetUnits: 50, targetReadyOn: "2026-06-10" });
    expect(tight.feasible).toBe(false);
    expect(tight.slackDays).toBeLessThan(0);
    expect(tight.stages.some((s) => s.late)).toBe(true);
  });

  it("colder incubation pushes the start date earlier (longer durations)", () => {
    const warm = backwardPlan({ ...base, tempC: 24, finalStage: "GRAIN_G2", targetUnits: 10, targetReadyOn: "2026-08-01" });
    const cold = backwardPlan({ ...base, tempC: 14, finalStage: "GRAIN_G2", targetUnits: 10, targetReadyOn: "2026-08-01" });
    expect(cold.totalDays).toBeGreaterThan(warm.totalDays);
    expect(new Date(cold.inoculateFirstBy).getTime()).toBeLessThan(new Date(warm.inoculateFirstBy).getTime());
  });

  it("respects a custom start stage (skip mother culture)", () => {
    const plan = backwardPlan({ ...base, finalStage: "SUBSTRATE_F1", startStage: "GRAIN_G1", targetUnits: 100, targetReadyOn: "2026-08-01" });
    expect(plan.stages[0]!.stage).toBe("GRAIN_G1");
    expect(plan.stages.every((s) => s.stage !== "MOTHER_CULTURE" && s.stage !== "LIQUID_CULTURE")).toBe(true);
  });
});
