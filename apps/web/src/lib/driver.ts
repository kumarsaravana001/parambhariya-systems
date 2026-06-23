import type {
  Farm, Room, Zone, Bag, Strain, Reading, Alert, Culture, StorageLocation, Category, CustomField, AuditEntry,
} from "@parambhariya/types";

/**
 * Data driver — the seam between the UI and storage.
 *  - httpDriver  → talks to the real apps/api backend (production / self-hosted)
 *  - localDriver → browser-persistent store + client-side control simulator,
 *                  so the static GitHub Pages demo is still fully dynamic + live.
 * Selected at runtime by VITE_API_URL.
 */

export type Resource =
  | "farms" | "rooms" | "zones" | "bags" | "strains"
  | "cultures" | "storage" | "categories" | "custom-fields";

export interface Summary {
  farms: number; rooms: number; zones: number; strains: number;
  bagsTotal: number; bagsActive: number; bagsHarvested: number; bagsContaminated: number;
  yieldKg: number; openAlerts: number; criticalAlerts: number;
  zonesAlarm: number; zonesWarn: number; successRate: number;
}

export interface LiveReading { zoneId: string; ts: string; status: Zone["status"]; tempC: number; rhPct: number; co2Ppm: number; lightLux: number; }

export interface Driver {
  mode: "api" | "local";
  list<T = any>(r: Resource): Promise<T[]>;
  get<T = any>(r: Resource, id: string): Promise<T>;
  create<T = any>(r: Resource, body: any): Promise<T>;
  update<T = any>(r: Resource, id: string, body: any): Promise<T>;
  remove(r: Resource, id: string): Promise<void>;
  setSetpoint(zoneId: string, body: { setpointTempC?: number; setpointRhPct?: number; setpointCo2Ppm?: number }): Promise<Zone>;
  readings(zoneId: string, limit?: number): Promise<Reading[]>;
  summary(): Promise<Summary>;
  alerts(open?: boolean): Promise<Alert[]>;
  ackAlert(id: string): Promise<Alert>;
  audit(): Promise<AuditEntry[]>;
  subscribe(onReading: (r: LiveReading) => void): () => void;
}

/* ── HTTP driver ────────────────────────────────────────────── */
function httpDriver(rawBase: string): Driver {
  // tolerate a scheme-less base (e.g. Render's fromService host) → assume https
  const base = /^https?:\/\//.test(rawBase) ? rawBase : `https://${rawBase}`;
  const url = (p: string) => `${base.replace(/\/$/, "")}${p}`;

  // One shared EventSource, ref-counted across all subscribers (mirrors the
  // local driver). Prevents N concurrent /events streams when multiple
  // components / nested routes call useLiveReadings() at once.
  const subs = new Set<(r: LiveReading) => void>();
  let es: EventSource | null = null;
  const ensureStream = () => {
    if (es) return;
    es = new EventSource(url("/events"));
    es.addEventListener("reading", (e) => {
      try { const r = JSON.parse((e as MessageEvent).data); subs.forEach((fn) => fn(r)); } catch {}
    });
  };
  async function jfetch<T>(p: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url(p), { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${p}`);
    return res.status === 204 ? (undefined as T) : res.json();
  }
  return {
    mode: "api",
    list: (r) => jfetch(`/${r}`),
    get: (r, id) => jfetch(`/${r}/${id}`),
    create: (r, body) => jfetch(`/${r}`, { method: "POST", body: JSON.stringify(body) }),
    update: (r, id, body) => jfetch(`/${r}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: async (r, id) => { await jfetch(`/${r}/${id}`, { method: "DELETE" }); },
    setSetpoint: (zoneId, body) => jfetch(`/zones/${zoneId}/setpoint`, { method: "PATCH", body: JSON.stringify(body) }),
    readings: (zoneId, limit = 60) => jfetch(`/zones/${zoneId}/readings?limit=${limit}`),
    summary: () => jfetch(`/summary`),
    alerts: (open) => jfetch(`/alerts${open ? "?open=1" : ""}`),
    ackAlert: (id) => jfetch(`/alerts/${id}/ack`, { method: "POST" }),
    audit: () => jfetch(`/audit`),
    subscribe(onReading) {
      subs.add(onReading);
      ensureStream();
      return () => {
        subs.delete(onReading);
        if (subs.size === 0 && es) { es.close(); es = null; }
      };
    },
  };
}

export { httpDriver };
import { localDriver } from "./local-driver";
export { localDriver };

const API = (import.meta as any).env?.VITE_API_URL as string | undefined;
let _driver: Driver | null = null;
export function getDriver(): Driver {
  if (_driver) return _driver;
  _driver = API ? httpDriver(API) : localDriver();
  return _driver;
}
export const DRIVER_MODE: "api" | "local" = API ? "api" : "local";
