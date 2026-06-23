import type {
  Zone, Reading, Alert, AuditEntry, ZoneStatus, AlertMetric, AlertSeverity,
} from "@parambhariya/types";
import type { Driver, Resource, Summary, LiveReading } from "./driver";
import { seedData } from "./seed-data";

/**
 * Browser-persistent driver. Mirrors the backend's REST + control loop so the
 * static Pages demo is fully dynamic AND live, with no server. Data lives in
 * localStorage; a setInterval runs the same control law as apps/api.
 *
 * The control math here intentionally mirrors apps/api/src/control.ts. The HTTP
 * driver is the real path; this is the offline twin.
 */

const KEY = "parambhariya.db.v1";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const nowISO = () => new Date().toISOString();

type Tables = {
  farms: any[]; rooms: any[]; zones: any[]; bags: any[]; strains: any[];
  cultures: any[]; storage: any[]; "custom-fields": any[]; categories: any[];
  readings: Reading[]; alerts: Alert[]; audit: AuditEntry[];
};

function load(): Tables {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded = seedData();
  persist(seeded);
  return seeded;
}
let _db: Tables | null = null;
function db(): Tables { return (_db ??= load()); }
function persist(t: Tables) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {} }
function save() { if (_db) persist(_db); }

/* ── control law (mirror of backend) ────────────────────────── */
function noise(seed: number, amp: number) { const x = Math.sin(seed * 12.9898) * 43758.5453; return ((x - Math.floor(x)) - 0.5) * 2 * amp; }
function approach(cur: number, target: number, gain: number, amp: number, seed: number) {
  return Math.round((cur + (target - cur) * gain + noise(seed, amp)) * 100) / 100;
}
let _tick = 0;
function stepZone(z: any): { tempC: number; rhPct: number; co2Ppm: number; lightLux: number } {
  const t = _tick++;
  const prev = z.tempC != null ? z : { tempC: z.setpointTempC + 2.5, rhPct: z.setpointRhPct - 4, co2Ppm: z.setpointCo2Ppm + 350, lightLux: 120 };
  return {
    tempC: approach(prev.tempC, z.setpointTempC, 0.25, 0.15, t + 1),
    rhPct: approach(prev.rhPct, z.setpointRhPct, 0.3, 0.5, t + 2),
    co2Ppm: Math.max(350, approach(prev.co2Ppm, z.setpointCo2Ppm, 0.2, 25, t + 3)),
    lightLux: Math.max(0, approach(prev.lightLux ?? 120, 150, 0.4, 8, t + 4)),
  };
}
function evalAlerts(z: any, r: { tempC: number; rhPct: number; co2Ppm: number }): { metric: AlertMetric; severity: AlertSeverity; value: string; threshold: string }[] {
  const out: any[] = [];
  const dT = Math.abs(r.tempC - z.setpointTempC);
  if (dT >= 4) out.push({ metric: "temp", severity: "critical", value: `${r.tempC.toFixed(1)} °C`, threshold: `±4 °C of ${z.setpointTempC} °C` });
  else if (dT >= 2) out.push({ metric: "temp", severity: "warn", value: `${r.tempC.toFixed(1)} °C`, threshold: `±2 °C of ${z.setpointTempC} °C` });
  const dR = Math.abs(r.rhPct - z.setpointRhPct);
  if (dR >= 10) out.push({ metric: "rh", severity: "critical", value: `${r.rhPct.toFixed(1)} %`, threshold: `±10 % of ${z.setpointRhPct} %` });
  else if (dR >= 5) out.push({ metric: "rh", severity: "warn", value: `${r.rhPct.toFixed(1)} %`, threshold: `±5 % of ${z.setpointRhPct} %` });
  const dC = r.co2Ppm - z.setpointCo2Ppm;
  if (dC >= 800) out.push({ metric: "co2", severity: "critical", value: `${Math.round(r.co2Ppm)} ppm`, threshold: `≤ ${z.setpointCo2Ppm + 800} ppm` });
  else if (dC >= 400) out.push({ metric: "co2", severity: "warn", value: `${Math.round(r.co2Ppm)} ppm`, threshold: `≤ ${z.setpointCo2Ppm + 400} ppm` });
  return out;
}
function statusOf(c: any[]): ZoneStatus { return c.some((x) => x.severity === "critical") ? "ALARM" : c.length ? "WARN" : "OK"; }

const subscribers = new Set<(r: LiveReading) => void>();
function runTick() {
  const t = db();
  const ts = nowISO();
  for (const z of t.zones) {
    const r = stepZone(z);
    const cands = evalAlerts(z, r);
    const status = statusOf(cands);
    Object.assign(z, r, { status, updatedAt: ts });
    t.readings.push({ id: uid(), zoneId: z.id, ts, ...r });
    // reconcile alerts
    const open = t.alerts.filter((a) => a.zoneId === z.id && a.acknowledgedAt == null);
    for (const cand of cands) {
      const ex = open.find((a) => a.metric === cand.metric);
      if (!ex) t.alerts.push({ id: uid(), zoneId: z.id, metric: cand.metric, severity: cand.severity, value: cand.value, threshold: cand.threshold, createdAt: ts, acknowledgedAt: null });
      else { ex.severity = cand.severity; ex.value = cand.value; ex.threshold = cand.threshold; }
    }
    for (const a of open) if (!cands.find((c) => c.metric === a.metric)) a.acknowledgedAt = ts;
    for (const fn of subscribers) { try { fn({ zoneId: z.id, ts, status, ...r }); } catch {} }
  }
  // trim readings
  const byZone: Record<string, Reading[]> = {};
  for (const rd of t.readings) (byZone[rd.zoneId] ??= []).push(rd);
  t.readings = Object.values(byZone).flatMap((arr) => arr.slice(-240));
  save();
}

let loopStarted = false;
function ensureLoop() {
  if (loopStarted || typeof window === "undefined") return;
  loopStarted = true;
  runTick();
  setInterval(runTick, 3000);
}

function audit(table: string, action: AuditEntry["action"], detail: string) {
  db().audit.unshift({ id: uid(), ts: nowISO(), user: "you", table, action, detail });
  db().audit = db().audit.slice(0, 200);
}
const labelOf = (row: any) => row.name ?? row.code ?? row.label ?? row.id;
const tableName: Record<Resource, string> = {
  farms: "Farms", rooms: "Rooms", zones: "Zones", bags: "Bags", strains: "Strains",
  cultures: "Cultures", storage: "Storage", categories: "Categories", "custom-fields": "Custom Fields",
};

export function localDriver(): Driver {
  ensureLoop();
  const tbl = (r: Resource) => (db() as any)[r] as any[];

  return {
    mode: "local",
    async list(r) { return structuredClone(tbl(r)); },
    async get(r, id) { const x = tbl(r).find((e) => e.id === id); if (!x) throw new Error("Not found"); return structuredClone(x); },
    async create(r, body) {
      const row: any = { id: uid(), ...defaultsFor(r), ...body };
      if (r === "bags") row.createdAt = nowISO();
      if (r === "cultures") row.createdAt = nowISO();
      if (r === "zones") Object.assign(row, { tempC: null, rhPct: null, co2Ppm: null, lightLux: null, status: "OK", updatedAt: null });
      tbl(r).push(row); audit(tableName[r], "Created", labelOf(row)); save();
      return structuredClone(row);
    },
    async update(r, id, body) {
      const x = tbl(r).find((e) => e.id === id); if (!x) throw new Error("Not found");
      Object.assign(x, body); audit(tableName[r], "Updated", labelOf(x)); save();
      return structuredClone(x);
    },
    async remove(r, id) {
      const arr = tbl(r); const i = arr.findIndex((e) => e.id === id);
      if (i >= 0) { audit(tableName[r], "Deleted", labelOf(arr[i])); arr.splice(i, 1); save(); }
    },
    async setSetpoint(zoneId, body) {
      const z = db().zones.find((e) => e.id === zoneId); if (!z) throw new Error("Not found");
      Object.assign(z, body); audit("Zones", "Updated", `${z.name} setpoint`); save();
      return structuredClone(z) as Zone;
    },
    async readings(zoneId, limit = 60) {
      return db().readings.filter((r) => r.zoneId === zoneId).slice(-limit);
    },
    async summary(): Promise<Summary> {
      const t = db();
      const active = t.bags.filter((b) => !["HARVESTED", "CONTAMINATED", "DISPOSED"].includes(b.status));
      const contaminated = t.bags.filter((b) => b.status === "CONTAMINATED");
      const open = t.alerts.filter((a) => a.acknowledgedAt == null);
      const yieldKg = t.bags.reduce((s, b) => s + (b.weightG ?? 0), 0) / 1000;
      return {
        farms: t.farms.length, rooms: t.rooms.length, zones: t.zones.length, strains: t.strains.length,
        bagsTotal: t.bags.length, bagsActive: active.length, bagsHarvested: t.bags.filter((b) => b.status === "HARVESTED").length,
        bagsContaminated: contaminated.length, yieldKg: Math.round(yieldKg * 100) / 100,
        openAlerts: open.length, criticalAlerts: open.filter((a) => a.severity === "critical").length,
        zonesAlarm: t.zones.filter((z) => z.status === "ALARM").length, zonesWarn: t.zones.filter((z) => z.status === "WARN").length,
        successRate: t.bags.length ? Math.round(((t.bags.length - contaminated.length) / t.bags.length) * 100) : 100,
      };
    },
    async alerts(open) { const a = [...db().alerts].reverse(); return open ? a.filter((x) => x.acknowledgedAt == null) : a; },
    async ackAlert(id) { const a = db().alerts.find((x) => x.id === id); if (!a) throw new Error("Not found"); a.acknowledgedAt = nowISO(); save(); return structuredClone(a); },
    async audit() { return structuredClone(db().audit); },
    subscribe(onReading) { subscribers.add(onReading); return () => subscribers.delete(onReading); },
  };
}

function defaultsFor(r: Resource): Record<string, any> {
  switch (r) {
    case "zones": return { setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 1000 };
    case "bags": return { stageProgress: 0, weightG: null };
    case "cultures": return { contaminated: false, gen: 1, stock: 0, storageId: null, categoryId: null, intervalDays: 15, nextTransfer: null, commonName: "", strainCode: "" };
    case "storage": return { parentId: null, tempRange: "" };
    case "categories": return { parentId: null };
    case "custom-fields": return { required: false };
    case "strains": return { scientific: "", yieldKg: 0 };
    default: return {};
  }
}

/** Test/dev helper — wipe the browser store. */
export function resetLocalDb() { try { localStorage.removeItem(KEY); } catch {} _db = null; }
