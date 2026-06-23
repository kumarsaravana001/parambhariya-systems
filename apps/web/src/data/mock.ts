/**
 * Mock data — farm → room → zone → bag.
 * Numbers pair value + space + unit; "—" is the canonical no-reading placeholder.
 */
import type { LifecycleStage } from "@parambhariya/ui";

export type { LifecycleStage };
export type LifecycleStatus = LifecycleStage;

export interface Farm {
  id: string;
  name: string;
  location: string;
}
export interface Room {
  id: string;
  farmId: string;
  name: string;
  purpose: "Colonization" | "Pinning" | "Fruiting" | "Storage";
}
export interface Zone {
  id: string;
  roomId: string;
  name: string;
  tempC: number;
  rhPct: number;
  co2Ppm: number;
  lightLux: number;
  status: "OK" | "WARN" | "ALARM";
  /** Last reading age, seconds. */
  ageSec: number;
  trendTemp: number[];
  trendRh: number[];
  trendCo2: number[];
  trendLight: number[];
}
export interface Strain {
  id: string;
  name: string;
  scientific: string;
  optimalTempC: [number, number];
  optimalRhPct: [number, number];
  cycleDays: number;
  yieldKg?: number;
}
export interface Bag {
  id: string;
  code: string;
  strainId: string;
  zoneId: string;
  status: LifecycleStage;
  ageDays: number;
  /** 0..1 within current stage. */
  stageProgress: number;
  weightG?: number;
  createdISO: string;
}
export interface Alert {
  id: string;
  zoneId: string;
  metric: "temp" | "rh" | "co2" | "light" | "offline";
  severity: "warn" | "critical";
  value: string;
  threshold: string;
  agoMin: number;
  acknowledged: boolean;
}
export interface TimelineRecord {
  id: string;
  bagId: string;
  title: string;
  description?: string;
  time: string;
  tone?: "default" | "success" | "warn" | "danger" | "info";
}

export const farms: Farm[] = [
  { id: "f-anaimalai", name: "Anaimalai Block A", location: "Anaimalai, Tamil Nadu" },
  { id: "f-pollachi",  name: "Pollachi Site",     location: "Pollachi, Tamil Nadu" },
];

export const rooms: Room[] = [
  { id: "r-a1", farmId: "f-anaimalai", name: "Room A-1", purpose: "Colonization" },
  { id: "r-a2", farmId: "f-anaimalai", name: "Room A-2", purpose: "Fruiting" },
  { id: "r-a3", farmId: "f-anaimalai", name: "Room A-3", purpose: "Pinning" },
  { id: "r-p1", farmId: "f-pollachi",  name: "Room P-1", purpose: "Colonization" },
  { id: "r-p2", farmId: "f-pollachi",  name: "Room P-2", purpose: "Fruiting" },
];

// Helper trend generators (small, smooth-ish noise)
const trend = (base: number, amp: number, n = 24) =>
  Array.from({ length: n }, (_, i) => base + Math.sin(i / 2) * amp + ((i * 37) % 13) / 11 * amp);

export const zones: Zone[] = [
  {
    id: "z-a1-c1", roomId: "r-a1", name: "Colonization Tunnel 1",
    tempC: 24.2, rhPct: 88.1, co2Ppm: 1480, lightLux: 12, status: "OK", ageSec: 18,
    trendTemp: trend(24, 0.4), trendRh: trend(88, 1.2), trendCo2: trend(1450, 60), trendLight: trend(12, 1),
  },
  {
    id: "z-a2-f1", roomId: "r-a2", name: "Fruiting Chamber 1",
    tempC: 27.9, rhPct: 91.4, co2Ppm: 925, lightLux: 220, status: "ALARM", ageSec: 22,
    trendTemp: trend(26.5, 1.4), trendRh: trend(91, 2), trendCo2: trend(900, 80), trendLight: trend(220, 20),
  },
  {
    id: "z-a3-p1", roomId: "r-a3", name: "Pinning Bench 1",
    tempC: 19.6, rhPct: 93.0, co2Ppm: 640, lightLux: 110, status: "OK", ageSec: 11,
    trendTemp: trend(19.6, 0.3), trendRh: trend(93, 1), trendCo2: trend(640, 40), trendLight: trend(110, 10),
  },
  {
    id: "z-p1-c1", roomId: "r-p1", name: "Colonization Tunnel 1",
    tempC: 25.1, rhPct: 86.2, co2Ppm: 1520, lightLux: 10, status: "OK", ageSec: 32,
    trendTemp: trend(25, 0.3), trendRh: trend(86, 1), trendCo2: trend(1500, 60), trendLight: trend(10, 1),
  },
  {
    id: "z-p2-f1", roomId: "r-p2", name: "Fruiting Chamber 1",
    tempC: 22.4, rhPct: 89.5, co2Ppm: 820, lightLux: 180, status: "WARN", ageSec: 870,
    trendTemp: trend(22, 0.5), trendRh: trend(89, 1.5), trendCo2: trend(820, 60), trendLight: trend(180, 15),
  },
];

export const strains: Strain[] = [
  { id: "s-pleurotus", name: "Pearl Oyster",   scientific: "Pleurotus ostreatus", optimalTempC: [22, 26], optimalRhPct: [85, 95], cycleDays: 22, yieldKg: 12.4 },
  { id: "s-lentinula", name: "Shiitake",       scientific: "Lentinula edodes",   optimalTempC: [16, 20], optimalRhPct: [80, 90], cycleDays: 90, yieldKg: 8.1  },
  { id: "s-ganoderma", name: "Reishi",         scientific: "Ganoderma lucidum",  optimalTempC: [24, 28], optimalRhPct: [85, 92], cycleDays: 75, yieldKg: 3.7  },
  { id: "s-hericium",  name: "Lion's Mane",    scientific: "Hericium erinaceus", optimalTempC: [18, 24], optimalRhPct: [85, 95], cycleDays: 50, yieldKg: 5.2  },
];

export const bags: Bag[] = [
  { id: "b-001", code: "AN-0142", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING",     ageDays: 24, stageProgress: 0.6, weightG: 320, createdISO: "2026-05-30" },
  { id: "b-002", code: "AN-0143", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING",     ageDays: 24, stageProgress: 0.55, createdISO: "2026-05-30" },
  { id: "b-003", code: "AN-0211", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "COLONIZING",   ageDays:  9, stageProgress: 0.4, createdISO: "2026-06-14" },
  { id: "b-004", code: "AN-0212", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "COLONIZING",   ageDays:  9, stageProgress: 0.4, createdISO: "2026-06-14" },
  { id: "b-005", code: "AN-0240", strainId: "s-ganoderma", zoneId: "z-a3-p1", status: "PINNING",      ageDays: 16, stageProgress: 0.7, createdISO: "2026-06-07" },
  { id: "b-006", code: "AN-0099", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "HARVESTED",    ageDays: 33, stageProgress: 1, weightG: 410, createdISO: "2026-05-21" },
  { id: "b-007", code: "AN-0301", strainId: "s-hericium",  zoneId: "z-a3-p1", status: "CREATED",      ageDays:  1, stageProgress: 0.1, createdISO: "2026-06-22" },
  { id: "b-008", code: "AN-0210", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "CONTAMINATED", ageDays: 11, stageProgress: 0, createdISO: "2026-06-12" },
  { id: "b-009", code: "PO-0501", strainId: "s-pleurotus", zoneId: "z-p2-f1", status: "FRUITING",     ageDays: 20, stageProgress: 0.45, createdISO: "2026-06-03" },
  { id: "b-010", code: "PO-0502", strainId: "s-pleurotus", zoneId: "z-p1-c1", status: "COLONIZING",   ageDays:  6, stageProgress: 0.25, createdISO: "2026-06-17" },
];

export const alerts: Alert[] = [
  { id: "al-1", zoneId: "z-a2-f1", metric: "temp", severity: "critical", value: "27.9 °C", threshold: "≤ 25 °C", agoMin:  3, acknowledged: false },
  { id: "al-2", zoneId: "z-a2-f1", metric: "rh",   severity: "warn",     value: "91.4 %",  threshold: "≤ 90 %",  agoMin: 12, acknowledged: false },
  { id: "al-3", zoneId: "z-p2-f1", metric: "offline", severity: "warn",  value: "—",       threshold: "≤ 60 s",  agoMin: 14, acknowledged: false },
];

export const bagTimeline = (bagId: string): TimelineRecord[] => [
  { id: `${bagId}-t1`, bagId, title: "Bag created",         description: "Substrate inoculated",          time: "24d ago",  tone: "default" },
  { id: `${bagId}-t2`, bagId, title: "Colonization started", description: "Moved to Room A-1",            time: "23d ago",  tone: "info" },
  { id: `${bagId}-t3`, bagId, title: "Colonization complete", description: "≥ 90 % surface coverage",    time: "8d ago",   tone: "success" },
  { id: `${bagId}-t4`, bagId, title: "Moved to fruiting",   description: "Room A-2 · Chamber 1",         time: "7d ago",   tone: "info" },
  { id: `${bagId}-t5`, bagId, title: "First pin observed",  description: "Trigger humidity raised",      time: "5d ago",   tone: "default" },
  { id: `${bagId}-t6`, bagId, title: "Harvest #1",          description: "320 g, grade A",               time: "today",    tone: "success" },
];

/** Aggregate helpers */
export const roomZones = (roomId: string) => zones.filter((z) => z.roomId === roomId);
export const roomAvg = (roomId: string): { tempC?: number; rhPct?: number; status: "OK" | "WARN" | "ALARM" } => {
  const zs = roomZones(roomId);
  if (zs.length === 0) return { tempC: undefined, rhPct: undefined, status: "OK" };
  const t = zs.reduce((s, z) => s + z.tempC, 0) / zs.length;
  const h = zs.reduce((s, z) => s + z.rhPct, 0) / zs.length;
  const status: "OK" | "WARN" | "ALARM" =
    zs.some((z) => z.status === "ALARM") ? "ALARM" : zs.some((z) => z.status === "WARN") ? "WARN" : "OK";
  return { tempC: t, rhPct: h, status };
};
export const farmRooms = (farmId: string) => rooms.filter((r) => r.farmId === farmId);
export const farmBags = (farmId: string) => bags.filter((b) => {
  const z = zones.find((zz) => zz.id === b.zoneId);
  if (!z) return false;
  const r = rooms.find((rr) => rr.id === z.roomId);
  return r?.farmId === farmId;
});
export const zoneBags = (zoneId: string) => bags.filter((b) => b.zoneId === zoneId);

export const farmAlertCount = (farmId: string) =>
  alerts.filter((a) => {
    const z = zones.find((zz) => zz.id === a.zoneId);
    if (!z) return false;
    const r = rooms.find((rr) => rr.id === z.roomId);
    return r?.farmId === farmId && !a.acknowledged;
  }).length;
