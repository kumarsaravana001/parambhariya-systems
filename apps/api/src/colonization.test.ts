import { describe, it, expect } from "vitest";
import { estimateColonization, colonizationForecast, tempTimeFactor } from "@parambhariya/types";

// Oyster optimum 22–26 °C
const MIN = 22, MAX = 26;

describe("colonization temperature model", () => {
  it("is fastest within the optimal band", () => {
    expect(tempTimeFactor(24, MIN, MAX).band).toBe("optimal");
    expect(tempTimeFactor(24, MIN, MAX).factor).toBeCloseTo(1, 1);
  });
  it("slows below the optimum (Q10-ish)", () => {
    const cold = tempTimeFactor(18, MIN, MAX);
    expect(cold.band).toBe("slow-cold");
    expect(cold.factor).toBeGreaterThan(1.2);
  });
  it("slows above the optimum", () => {
    const hot = tempTimeFactor(29, MIN, MAX);
    expect(hot.band).toBe("slow-heat");
    expect(hot.factor).toBeGreaterThan(1.2);
  });
  it("stalls when far too cold or too hot", () => {
    expect(tempTimeFactor(8, MIN, MAX).band).toBe("stalled-cold");
    expect(tempTimeFactor(36, MIN, MAX).band).toBe("stalled-heat");
  });
  it("scales the base colonization days by the factor", () => {
    const optimal = estimateColonization(12, MIN, MAX, 24);
    const cold = estimateColonization(12, MIN, MAX, 18);
    expect(optimal.estimatedDays).toBeLessThan(cold.estimatedDays);
    expect(optimal.estimatedDays).toBe(12);
  });
});

describe("colonization forecast", () => {
  it("projects a ready date and progress", () => {
    const f = colonizationForecast("2026-06-01", 12, "2026-06-07");
    expect(f.readyOn).toBe("2026-06-13");
    expect(f.daysElapsed).toBe(6);
    expect(f.daysRemaining).toBe(6);
    expect(f.progress).toBeCloseTo(0.5, 1);
    expect(f.isReady).toBe(false);
  });
  it("marks ready once elapsed ≥ estimate", () => {
    const f = colonizationForecast("2026-06-01", 12, "2026-06-20");
    expect(f.isReady).toBe(true);
    expect(f.daysRemaining).toBe(0);
    expect(f.progress).toBe(1);
  });
});
