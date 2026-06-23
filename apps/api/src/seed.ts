import { nanoid } from "nanoid";
import { schema, type Db } from "./db/index.js";

/** Idempotent: only seeds when the DB is empty. */
export function seed(db: Db) {
  const existing = db.select().from(schema.farms).all();
  if (existing.length > 0) return false;

  const now = new Date();
  const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

  const strains = [
    { id: "s-pleurotus", name: "Pearl Oyster", scientific: "Pleurotus ostreatus", optimalTempMin: 22, optimalTempMax: 26, optimalRhMin: 85, optimalRhMax: 95, cycleDays: 22, yieldKg: 12.4 },
    { id: "s-lentinula", name: "Shiitake", scientific: "Lentinula edodes", optimalTempMin: 16, optimalTempMax: 20, optimalRhMin: 80, optimalRhMax: 90, cycleDays: 90, yieldKg: 8.1 },
    { id: "s-ganoderma", name: "Reishi", scientific: "Ganoderma lucidum", optimalTempMin: 24, optimalTempMax: 28, optimalRhMin: 85, optimalRhMax: 92, cycleDays: 75, yieldKg: 3.7 },
    { id: "s-hericium", name: "Lion's Mane", scientific: "Hericium erinaceus", optimalTempMin: 18, optimalTempMax: 24, optimalRhMin: 85, optimalRhMax: 95, cycleDays: 50, yieldKg: 5.2 },
  ];
  for (const s of strains) db.insert(schema.strains).values(s).run();

  const farms = [
    { id: "f-anaimalai", name: "Anaimalai Block A", location: "Anaimalai, Tamil Nadu" },
    { id: "f-pollachi", name: "Pollachi Site", location: "Pollachi, Tamil Nadu" },
  ];
  for (const f of farms) db.insert(schema.farms).values(f).run();

  const rooms = [
    { id: "r-a1", farmId: "f-anaimalai", name: "Room A-1", purpose: "Colonization" },
    { id: "r-a2", farmId: "f-anaimalai", name: "Room A-2", purpose: "Fruiting" },
    { id: "r-a3", farmId: "f-anaimalai", name: "Room A-3", purpose: "Pinning" },
    { id: "r-p1", farmId: "f-pollachi", name: "Room P-1", purpose: "Colonization" },
    { id: "r-p2", farmId: "f-pollachi", name: "Room P-2", purpose: "Fruiting" },
  ];
  for (const r of rooms) db.insert(schema.rooms).values(r).run();

  const zones = [
    { id: "z-a1-c1", roomId: "r-a1", name: "Colonization Tunnel 1", setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 1400 },
    { id: "z-a2-f1", roomId: "r-a2", name: "Fruiting Chamber 1", setpointTempC: 24, setpointRhPct: 90, setpointCo2Ppm: 800 },
    { id: "z-a3-p1", roomId: "r-a3", name: "Pinning Bench 1", setpointTempC: 20, setpointRhPct: 93, setpointCo2Ppm: 650 },
    { id: "z-p1-c1", roomId: "r-p1", name: "Colonization Tunnel 1", setpointTempC: 25, setpointRhPct: 86, setpointCo2Ppm: 1500 },
    { id: "z-p2-f1", roomId: "r-p2", name: "Fruiting Chamber 1", setpointTempC: 22, setpointRhPct: 89, setpointCo2Ppm: 820 },
  ];
  for (const z of zones) db.insert(schema.zones).values({ ...z, tempC: null, rhPct: null, co2Ppm: null, lightLux: null, status: "OK", updatedAt: null }).run();

  const bags = [
    { code: "AN-0142", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING", stageProgress: 0.6, weightG: 320, age: 24 },
    { code: "AN-0143", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "FRUITING", stageProgress: 0.55, weightG: null, age: 24 },
    { code: "AN-0211", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "COLONIZING", stageProgress: 0.4, weightG: null, age: 9 },
    { code: "AN-0240", strainId: "s-ganoderma", zoneId: "z-a3-p1", status: "PINNING", stageProgress: 0.7, weightG: null, age: 16 },
    { code: "AN-0099", strainId: "s-pleurotus", zoneId: "z-a2-f1", status: "HARVESTED", stageProgress: 1, weightG: 410, age: 33 },
    { code: "AN-0301", strainId: "s-hericium", zoneId: "z-a3-p1", status: "CREATED", stageProgress: 0.1, weightG: null, age: 1 },
    { code: "AN-0210", strainId: "s-lentinula", zoneId: "z-a1-c1", status: "CONTAMINATED", stageProgress: 0, weightG: null, age: 11 },
    { code: "PO-0501", strainId: "s-pleurotus", zoneId: "z-p2-f1", status: "FRUITING", stageProgress: 0.45, weightG: null, age: 20 },
  ];
  for (const b of bags) db.insert(schema.bags).values({
    id: nanoid(), code: b.code, strainId: b.strainId, zoneId: b.zoneId, status: b.status,
    stageProgress: b.stageProgress, weightG: b.weightG, createdAt: iso(b.age),
  }).run();

  // Lab seed
  const cats = [
    { id: "c1", parentId: null, name: "Fungi" },
    { id: "c1a", parentId: "c1", name: "Basidiomycetes" },
    { id: "c1b", parentId: "c1", name: "Ascomycetes" },
    { id: "c2", parentId: null, name: "Bacteria" },
  ];
  for (const c of cats) db.insert(schema.categories).values(c).run();

  const store = [
    { id: "b1", parentId: null, name: "Main Lab Building", type: "building", tempRange: "" },
    { id: "r1", parentId: "b1", name: "Culture Room", type: "room", tempRange: "" },
    { id: "f1", parentId: "r1", name: "Freezer A", type: "freezer", tempRange: "-20 °C" },
    { id: "uf1", parentId: "r1", name: "Ultra-Low Freezer", type: "ultra low freezer", tempRange: "-80 °C" },
    { id: "inc1", parentId: "r1", name: "Incubator 1", type: "incubator", tempRange: "25 °C" },
  ];
  for (const s of store) db.insert(schema.storageLocations).values(s).run();

  const cultures = [
    { code: "CB-001", genus: "Pleurotus", species: "ostreatus", commonName: "Pearl Oyster MC", strainCode: "PO-2024-A", kingdom: "Fungi", status: "active", contaminated: false, gen: 3, stock: 12, storageId: "f1", categoryId: "c1a", intervalDays: 15, age: 24 },
    { code: "CB-002", genus: "Lentinula", species: "edodes", commonName: "Shiitake Master", strainCode: "LE-2023-B", kingdom: "Fungi", status: "active", contaminated: false, gen: 5, stock: 8, storageId: "f1", categoryId: "c1a", intervalDays: 30, age: 40 },
    { code: "CB-005", genus: "Trichoderma", species: "harzianum", commonName: "Contaminant isolate", strainCode: "TH-X", kingdom: "Fungi", status: "quarantine", contaminated: true, gen: 1, stock: 1, storageId: "inc1", categoryId: "c1b", intervalDays: 7, age: 11 },
  ];
  for (const c of cultures) db.insert(schema.cultures).values({
    id: nanoid(), code: c.code, genus: c.genus, species: c.species, commonName: c.commonName, strainCode: c.strainCode,
    kingdom: c.kingdom, status: c.status, contaminated: c.contaminated, gen: c.gen, stock: c.stock,
    storageId: c.storageId, categoryId: c.categoryId, intervalDays: c.intervalDays, nextTransfer: null, createdAt: iso(c.age),
  }).run();

  const fields = [
    { id: nanoid(), label: "Collection Site", type: "Text", required: false },
    { id: nanoid(), label: "Substrate", type: "Dropdown", required: true },
  ];
  for (const f of fields) db.insert(schema.customFields).values(f).run();

  return true;
}
