import { describe, it, expect } from "vitest";
import { descendantsOf, biologicalEfficiency, beRating } from "@parambhariya/types";

describe("lineage propagation (descendantsOf)", () => {
  const batches = [
    { id: "A", parentId: null },     // mother culture
    { id: "B", parentId: "A" },      // G1 from A
    { id: "AA", parentId: "B" },     // F1 from B
    { id: "C", parentId: null },     // unrelated
    { id: "BB", parentId: "B" },     // another child of B
  ];

  it("returns all transitive descendants of a contaminated batch", () => {
    const d = descendantsOf(batches, "A").map((x) => x.id).sort();
    expect(d).toEqual(["AA", "B", "BB"]);
  });
  it("returns only the subtree for a mid-chain batch", () => {
    const d = descendantsOf(batches, "B").map((x) => x.id).sort();
    expect(d).toEqual(["AA", "BB"]);
  });
  it("returns nothing for a leaf", () => {
    expect(descendantsOf(batches, "AA")).toEqual([]);
  });
  it("does not flag unrelated lineages", () => {
    expect(descendantsOf(batches, "A").some((x) => x.id === "C")).toBe(false);
  });
});

describe("biological efficiency", () => {
  it("computes BE% from fresh weight and dry substrate", () => {
    // 1000 g fresh from 1 kg dry substrate = 100%
    expect(biologicalEfficiency(1000, 1)).toBe(100);
    // 320 g from 1.2 kg ≈ 26.7%
    expect(biologicalEfficiency(320, 1.2)).toBeCloseTo(26.7, 1);
  });
  it("returns null when inputs are missing", () => {
    expect(biologicalEfficiency(null, 1)).toBeNull();
    expect(biologicalEfficiency(500, 0)).toBeNull();
  });
  it("rates BE bands sensibly", () => {
    expect(beRating(90).tone).toBe("success");
    expect(beRating(40).tone).toBe("warn");
    expect(beRating(10).tone).toBe("danger");
  });
});
