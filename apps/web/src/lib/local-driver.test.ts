import { describe, it, expect, beforeEach, vi } from "vitest";
import { localDriver, resetLocalDb } from "./local-driver";

// freeze real timers so the demo control loop doesn't fire during assertions
vi.useFakeTimers();

beforeEach(() => {
  localStorage.clear();
  resetLocalDb();
});

describe("local driver (browser demo backend)", () => {
  it("seeds farms, zones and bags", async () => {
    const d = localDriver();
    expect((await d.list("farms")).length).toBe(2);
    expect((await d.list("zones")).length).toBe(5);
    expect((await d.list("bags")).length).toBeGreaterThan(0);
  });

  it("creates, updates and deletes a farm", async () => {
    const d = localDriver();
    const created = await d.create("farms", { name: "Test", location: "X" });
    expect(created.id).toBeTruthy();
    expect((await d.list("farms")).some((f: any) => f.id === created.id)).toBe(true);

    const upd = await d.update("farms", created.id, { name: "Renamed" });
    expect(upd.name).toBe("Renamed");

    await d.remove("farms", created.id);
    expect((await d.list("farms")).some((f: any) => f.id === created.id)).toBe(false);
  });

  it("records writes in the audit log", async () => {
    const d = localDriver();
    await d.create("strains", { name: "Enoki", scientific: "Flammulina velutipes", optimalTempMin: 6, optimalTempMax: 12, optimalRhMin: 80, optimalRhMax: 90, cycleDays: 60, yieldKg: 1 });
    const audit = await d.audit();
    expect(audit.some((a) => a.action === "Created" && a.table === "Strains")).toBe(true);
  });

  it("changes a zone setpoint", async () => {
    const d = localDriver();
    const z = await d.setSetpoint("z-a2-f1", { setpointTempC: 19 });
    expect(z.setpointTempC).toBe(19);
  });

  it("computes a summary", async () => {
    const d = localDriver();
    const s = await d.summary();
    expect(s.farms).toBe(2);
    expect(s.zones).toBe(5);
    expect(typeof s.successRate).toBe("number");
  });

  it("persists across driver instances (localStorage)", async () => {
    const d1 = localDriver();
    await d1.create("farms", { name: "Persisted", location: "Y" });
    // a second call reads the same store
    const d2 = localDriver();
    expect((await d2.list("farms")).some((f: any) => f.name === "Persisted")).toBe(true);
  });
});
