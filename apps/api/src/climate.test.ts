import { describe, it, expect } from "vitest";
import {
  STAGE_CLIMATE, stageTargetForStrain, setpointsForTarget, climateFit,
  purposeToStage, bagStageToCultivation, dominantCropStage,
} from "@parambhariya/types";
import type { Strain } from "@parambhariya/types";

const oyster: Strain = {
  id: "s1", name: "Blue Oyster", scientific: "Pleurotus ostreatus",
  optimalTempMin: 22, optimalTempMax: 26, optimalRhMin: 82, optimalRhMax: 88,
  optimalCo2Max: 800, cycleDays: 35, colonizationDays: 16, fruitingDays: 7,
  yieldKg: 0, supplier: "", notes: "",
};

describe("stage → cultivation mapping", () => {
  it("maps room purpose to stage", () => {
    expect(purposeToStage("Colonization")).toBe("colonization");
    expect(purposeToStage("Fruiting")).toBe("fruiting");
    expect(purposeToStage("Storage")).toBeNull();
  });
  it("maps bag lifecycle to crop stage", () => {
    expect(bagStageToCultivation("COLONIZING")).toBe("colonization");
    expect(bagStageToCultivation("FRUITING")).toBe("fruiting");
    expect(bagStageToCultivation("HARVESTED")).toBeNull();
  });
  it("finds the dominant crop stage in a mixed zone", () => {
    expect(dominantCropStage(["COLONIZING", "FRUITING", "FRUITING", "HARVESTED"])).toBe("fruiting");
    expect(dominantCropStage(["HARVESTED", "DISPOSED"])).toBeNull();
  });
});

describe("strain-anchored targets", () => {
  it("anchors colonization temp to the strain optimum midpoint", () => {
    const t = stageTargetForStrain(oyster, "colonization");
    expect(t.tempC).toBe(24); // (22+26)/2
  });
  it("drops temperature for pinning (cool shock)", () => {
    const t = stageTargetForStrain(oyster, "pinning");
    expect(t.tempC).toBeLessThan(stageTargetForStrain(oyster, "colonization").tempC);
    expect(t.co2Ppm).toBe(STAGE_CLIMATE.pinning.co2Ppm); // CO₂ from reference
  });
  it("falls back to reference when strain optima are unusable", () => {
    const bad = { ...oyster, optimalTempMin: 25, optimalTempMax: 25 };
    expect(stageTargetForStrain(bad, "fruiting")).toEqual(STAGE_CLIMATE.fruiting);
  });
});

describe("climate fit", () => {
  it("passes when setpoints match the target", () => {
    const target = stageTargetForStrain(oyster, "fruiting");
    const fit = climateFit(setpointsForTarget(target), target);
    expect(fit.worst).toBe("ok");
  });
  it("flags colonization CO₂ left on a fruiting crop as off", () => {
    const target = stageTargetForStrain(oyster, "fruiting");
    const fit = climateFit({ setpointTempC: target.tempC, setpointRhPct: target.rhPct, setpointCo2Ppm: 2000 }, target);
    const co2 = fit.metrics.find((m) => m.metric === "co2")!;
    expect(co2.verdict).toBe("off");
    expect(fit.worst).toBe("off");
  });
  it("does not penalise sitting below a high colonization CO₂ target", () => {
    const target = stageTargetForStrain(oyster, "colonization");
    const fit = climateFit({ setpointTempC: target.tempC, setpointRhPct: target.rhPct, setpointCo2Ppm: 1000 }, target);
    expect(fit.metrics.find((m) => m.metric === "co2")!.verdict).toBe("ok");
  });
  it("warns on a moderate temperature drift", () => {
    const target = stageTargetForStrain(oyster, "fruiting");
    const fit = climateFit({ setpointTempC: target.tempC + 2.5, setpointRhPct: target.rhPct, setpointCo2Ppm: setpointsForTarget(target).setpointCo2Ppm }, target);
    expect(fit.metrics.find((m) => m.metric === "temp")!.verdict).toBe("warn");
  });
});
