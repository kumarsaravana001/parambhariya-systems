import { describe, it, expect } from "vitest";
import { stepZone, evaluateAlerts, statusFromAlerts } from "./control.js";

const sp = { setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 1000 };

describe("control loop", () => {
  it("drives a cold-start reading toward the setpoint over time", () => {
    let r = stepZone(sp, null, 0);
    const firstErr = Math.abs(r.tempC - sp.setpointTempC);
    for (let i = 1; i < 30; i++) r = stepZone(sp, r, i);
    const laterErr = Math.abs(r.tempC - sp.setpointTempC);
    expect(laterErr).toBeLessThan(firstErr);
    expect(laterErr).toBeLessThan(0.6); // converged near setpoint
  });

  it("keeps co2 and light non-negative", () => {
    let r = stepZone({ setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 0 }, null, 0);
    for (let i = 1; i < 20; i++) r = stepZone({ setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 0 }, r, i);
    expect(r.co2Ppm).toBeGreaterThanOrEqual(350);
    expect(r.lightLux).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic for the same inputs", () => {
    expect(stepZone(sp, { tempC: 26, rhPct: 84, co2Ppm: 1300, lightLux: 120 }, 7))
      .toEqual(stepZone(sp, { tempC: 26, rhPct: 84, co2Ppm: 1300, lightLux: 120 }, 7));
  });
});

describe("alert evaluation", () => {
  it("no alert when reading is within band", () => {
    expect(evaluateAlerts(sp, { tempC: 24.2, rhPct: 88.5, co2Ppm: 1010, lightLux: 150 })).toEqual([]);
  });
  it("warns on moderate temp deviation", () => {
    const a = evaluateAlerts(sp, { tempC: 26.5, rhPct: 88, co2Ppm: 1000, lightLux: 150 });
    expect(a.find((x) => x.metric === "temp")?.severity).toBe("warn");
  });
  it("criticals on large temp deviation", () => {
    const a = evaluateAlerts(sp, { tempC: 30, rhPct: 88, co2Ppm: 1000, lightLux: 150 });
    expect(a.find((x) => x.metric === "temp")?.severity).toBe("critical");
    expect(statusFromAlerts(a)).toBe("ALARM");
  });
  it("flags high CO2 above setpoint", () => {
    const a = evaluateAlerts(sp, { tempC: 24, rhPct: 88, co2Ppm: 1900, lightLux: 150 });
    expect(a.find((x) => x.metric === "co2")?.severity).toBe("critical");
  });
  it("status is WARN with only warn-level candidates", () => {
    const a = evaluateAlerts(sp, { tempC: 24, rhPct: 94, co2Ppm: 1000, lightLux: 150 });
    expect(statusFromAlerts(a)).toBe("WARN");
  });
});
