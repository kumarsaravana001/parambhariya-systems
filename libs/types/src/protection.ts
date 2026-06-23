/**
 * Crop-protection + yield helpers (pure, shared by api + web).
 *  - descendantsOf: lineage propagation — when a spawn batch is contaminated,
 *    every batch transferred down from it is at risk and must be quarantined.
 *  - biologicalEfficiency: BE% = fresh mushroom weight ÷ dry substrate weight × 100,
 *    the standard commercial yield KPI.
 */

interface HasLineage { id: string; parentId?: string | null }

/** All batches that descend (transitively) from `rootId`. */
export function descendantsOf<T extends HasLineage>(batches: T[], rootId: string): T[] {
  const childrenByParent = new Map<string, T[]>();
  for (const b of batches) {
    if (b.parentId) {
      const arr = childrenByParent.get(b.parentId) ?? [];
      arr.push(b);
      childrenByParent.set(b.parentId, arr);
    }
  }
  const out: T[] = [];
  const seen = new Set<string>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of childrenByParent.get(id) ?? []) {
      if (!seen.has(child.id)) {
        seen.add(child.id);
        out.push(child);
        stack.push(child.id);
      }
    }
  }
  return out;
}

/** BE% = fresh weight (g) / dry substrate weight (kg → g) × 100. Null if inputs missing. */
export function biologicalEfficiency(freshWeightG?: number | null, drySubstrateKg?: number | null): number | null {
  if (!freshWeightG || !drySubstrateKg) return null;
  return Math.round((freshWeightG / (drySubstrateKg * 1000)) * 100 * 10) / 10;
}

/** Qualitative read on a BE% number (oyster-ish benchmarks). */
export function beRating(be: number): { label: string; tone: "success" | "warn" | "danger" | "neutral" } {
  if (be >= 80) return { label: "Excellent", tone: "success" };
  if (be >= 50) return { label: "Good", tone: "success" };
  if (be >= 30) return { label: "Fair", tone: "warn" };
  return { label: "Low", tone: "danger" };
}
