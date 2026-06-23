import { describe, it, expect } from "vitest";
import { buildTree } from "./tree";

describe("buildTree", () => {
  it("nests children under parents and keeps roots", () => {
    const rows = [
      { id: "a", parentId: null, name: "Building" },
      { id: "b", parentId: "a", name: "Room" },
      { id: "c", parentId: "b", name: "Freezer" },
      { id: "d", parentId: null, name: "Other building" },
    ];
    const tree = buildTree(rows);
    expect(tree).toHaveLength(2);
    expect(tree[0]!.name).toBe("Building");
    expect(tree[0]!.children?.[0]!.name).toBe("Room");
    expect(tree[0]!.children?.[0]!.children?.[0]!.name).toBe("Freezer");
    expect(tree[1]!.children).toBeUndefined(); // leaf has no empty children array
  });

  it("treats orphans (missing parent) as roots", () => {
    const tree = buildTree([{ id: "x", parentId: "missing", name: "Orphan" }]);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.name).toBe("Orphan");
  });

  it("applies a badge function", () => {
    const tree = buildTree([{ id: "a", parentId: null, name: "Freezer", tempRange: "-20 °C" }], (r) => r.tempRange);
    expect(tree[0]!.badge).toBe("-20 °C");
  });
});
