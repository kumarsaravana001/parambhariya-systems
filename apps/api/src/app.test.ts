import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type Db } from "./db/index.js";
import { createApp } from "./app.js";
import { seed } from "./seed.js";
import { tick } from "./loop.js";

let db: Db;
let app: ReturnType<typeof createApp>;

function req(path: string, init?: RequestInit) {
  return app.request(path, init);
}
const json = (method: string, body: unknown) => ({
  method, headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

beforeEach(() => {
  db = createDb(":memory:");
  seed(db);
  app = createApp(db);
});

describe("health + summary", () => {
  it("health ok", async () => {
    const r = await req("/health");
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
  });
  it("summary returns server-computed KPIs", async () => {
    const s = await (await req("/summary")).json();
    expect(s.farms).toBe(2);
    expect(s.zones).toBe(5);
    expect(s.bagsTotal).toBeGreaterThan(0);
    expect(typeof s.successRate).toBe("number");
  });
});

describe("CRUD lifecycle (farms)", () => {
  it("create → read → update → delete", async () => {
    const created = await (await req("/farms", json("POST", { name: "Test Farm", location: "X" }))).json();
    expect(created.id).toBeTruthy();

    const got = await (await req(`/farms/${created.id}`)).json();
    expect(got.name).toBe("Test Farm");

    const upd = await (await req(`/farms/${created.id}`, json("PATCH", { name: "Renamed" }))).json();
    expect(upd.name).toBe("Renamed");

    const del = await req(`/farms/${created.id}`, { method: "DELETE" });
    expect(del.status).toBe(200);

    const after = await req(`/farms/${created.id}`);
    expect(after.status).toBe(404);
  });

  it("rejects invalid payloads with 400", async () => {
    const r = await req("/farms", json("POST", { location: "no name" }));
    expect(r.status).toBe(400);
  });

  it("writes change to the audit log", async () => {
    await req("/strains", json("POST", { name: "Enoki", scientific: "Flammulina velutipes", optimalTempMin: 6, optimalTempMax: 12, optimalRhMin: 80, optimalRhMax: 90, cycleDays: 60 }));
    const audit = await (await req("/audit")).json();
    expect(audit.some((a: any) => a.action === "Created" && a.table === "Strains")).toBe(true);
  });
});

describe("temperature control + alerts", () => {
  it("setpoint write changes the zone target", async () => {
    const z = await (await req("/zones/z-a2-f1/setpoint", json("PATCH", { setpointTempC: 18 }))).json();
    expect(z.setpointTempC).toBe(18);
  });

  it("a far setpoint raises a critical temp alert once the zone has settled", async () => {
    // warm up at the seeded setpoint so the reading is near ~24 °C
    for (let i = 0; i < 20; i++) tick(db, i);
    // now yank the setpoint far away — the measured value lags → big deviation
    await req("/zones/z-a2-f1/setpoint", json("PATCH", { setpointTempC: 10 }));
    tick(db, 21);
    const open = await (await req("/alerts?open=1")).json();
    const tempAlert = open.find((a: any) => a.zoneId === "z-a2-f1" && a.metric === "temp");
    expect(tempAlert).toBeTruthy();
    expect(tempAlert.severity).toBe("critical");
  });

  it("alerts auto-resolve once the controller converges", async () => {
    await req("/zones/z-a2-f1/setpoint", json("PATCH", { setpointTempC: 10 }));
    for (let i = 0; i < 40; i++) tick(db, i);
    const open = await (await req("/alerts?open=1")).json();
    expect(open.find((a: any) => a.zoneId === "z-a2-f1" && a.metric === "temp")).toBeFalsy();
  });

  it("records readings and exposes the time series", async () => {
    for (let i = 0; i < 5; i++) tick(db, i);
    const rs = await (await req("/zones/z-a2-f1/readings?limit=10")).json();
    expect(rs.length).toBe(5);
    expect(rs[0].ts <= rs[rs.length - 1].ts).toBe(true); // ascending
  });

  it("rejects an empty PATCH with 400 (no 500)", async () => {
    expect((await req("/farms", json("PATCH", {}))).status).not.toBe(200); // no target id → 404
    const farm = await (await req("/farms", json("POST", { name: "Tmp" }))).json();
    expect((await req(`/farms/${farm.id}`, json("PATCH", {}))).status).toBe(400);
    expect((await req("/zones/z-a2-f1/setpoint", json("PATCH", {}))).status).toBe(400);
  });

  it("rejects an over-long name with 400 (bounded strings)", async () => {
    const r = await req("/farms", json("POST", { name: "x".repeat(5000) }));
    expect(r.status).toBe(400);
  });

  it("keeps the alert threshold consistent with severity as it escalates", async () => {
    // settle, then push the setpoint far so temp deviates into critical
    for (let i = 0; i < 20; i++) tick(db, i);
    await req("/zones/z-a2-f1/setpoint", json("PATCH", { setpointTempC: 10 }));
    tick(db, 21);
    let a = (await (await req("/alerts?open=1")).json()).find((x: any) => x.zoneId === "z-a2-f1" && x.metric === "temp");
    expect(a.severity).toBe("critical");
    expect(a.threshold).toContain("±4"); // critical threshold string, not the warn ±2
  });

  it("acknowledges an alert", async () => {
    await req("/zones/z-a2-f1/setpoint", json("PATCH", { setpointTempC: 10 }));
    tick(db, 0);
    const open = await (await req("/alerts?open=1")).json();
    const acked = await (await req(`/alerts/${open[0].id}/ack`, { method: "POST" })).json();
    expect(acked.acknowledgedAt).toBeTruthy();
  });
});

describe("lab CRUD", () => {
  it("creates a culture", async () => {
    const c = await (await req("/cultures", json("POST", { code: "CB-900", genus: "Pleurotus", species: "djamor", kingdom: "Fungi", status: "active" }))).json();
    expect(c.code).toBe("CB-900");
    expect(c.createdAt).toBeTruthy();
  });
  it("creates nested storage + categories", async () => {
    const loc = await (await req("/storage", json("POST", { name: "Box 9", type: "box" }))).json();
    expect(loc.id).toBeTruthy();
    const cat = await (await req("/categories", json("POST", { name: "Yeasts" }))).json();
    expect(cat.name).toBe("Yeasts");
  });
});
