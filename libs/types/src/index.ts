import { z } from "zod";

/* ─────────────────────────────────────────────────────────────
   Parambhariya domain — shared contract for API + web.
   Every entity has a Zod schema (runtime validation) and an
   inferred TS type. Create payloads omit server-managed fields.
   ───────────────────────────────────────────────────────────── */

export const id = z.string().min(1).max(64);
export const ISO = z.string().max(40); // ISO-8601 timestamp

// bounded user-supplied strings (defense-in-depth against oversized writes)
const name = z.string().min(1).max(200);
const shortText = z.string().max(200);
const code = z.string().min(1).max(64);
const shortCode = z.string().max(64);
const notes = z.string().max(2000).default("");
const dateStr = z.string().max(40).default(""); // YYYY-MM-DD (or empty)
const count = z.number().int().nonnegative().default(0);
const area = z.number().nonnegative().default(0);

/* ── Strain ─────────────────────────────────────────────────── */
export const Strain = z.object({
  id,
  name,
  scientific: shortText.default(""),
  optimalTempMin: z.number(),
  optimalTempMax: z.number(),
  optimalRhMin: z.number(),
  optimalRhMax: z.number(),
  optimalCo2Max: z.number().nonnegative().default(1000),
  cycleDays: z.number().int().positive(),
  colonizationDays: count,        // days from inoculation to full colonization
  fruitingDays: count,            // days in fruiting
  yieldKg: z.number().nonnegative().default(0),
  supplier: shortText.default(""),
  notes,
});
export const StrainCreate = Strain.omit({ id: true });
export type Strain = z.infer<typeof Strain>;
export type StrainCreate = z.infer<typeof StrainCreate>;

/* ── Farm ───────────────────────────────────────────────────── */
export const Farm = z.object({
  id,
  name,
  location: shortText.default(""),
  areaSqM: area,            // total cultivation area
  bagCapacity: count,       // max bags the farm can hold
  manager: shortText.default(""),
  phone: shortCode.default(""),
  establishedOn: dateStr,
});
export const FarmCreate = Farm.omit({ id: true });
export type Farm = z.infer<typeof Farm>;
export type FarmCreate = z.infer<typeof FarmCreate>;

/* ── Room ───────────────────────────────────────────────────── */
export const RoomPurpose = z.enum(["Colonization", "Pinning", "Fruiting", "Storage"]);
export const Room = z.object({
  id,
  farmId: id,
  name,
  purpose: RoomPurpose,
  sizeSqM: area,            // floor area of the room
  bagCapacity: count,       // total bags this room holds
  rackCount: count,         // number of racks/shelves
  notes,
});
export const RoomCreate = Room.omit({ id: true });
export type Room = z.infer<typeof Room>;
export type RoomCreate = z.infer<typeof RoomCreate>;
export type RoomPurpose = z.infer<typeof RoomPurpose>;

/* ── Zone (carries setpoints + latest reading) ──────────────── */
export const ZoneStatus = z.enum(["OK", "WARN", "ALARM"]);
export const Zone = z.object({
  id,
  roomId: id,
  name,
  bagCapacity: count,        // bags this zone holds
  deviceId: shortCode.default(""), // edge controller / sensor module id
  setpointTempC: z.number().default(24),
  setpointRhPct: z.number().default(88),
  setpointCo2Ppm: z.number().default(1000),
  // latest reading (denormalized for fast list rendering)
  tempC: z.number().nullable().default(null),
  rhPct: z.number().nullable().default(null),
  co2Ppm: z.number().nullable().default(null),
  lightLux: z.number().nullable().default(null),
  status: ZoneStatus.default("OK"),
  updatedAt: ISO.nullable().default(null),
});
export const ZoneCreate = Zone.pick({ roomId: true, name: true, bagCapacity: true, deviceId: true, setpointTempC: true, setpointRhPct: true, setpointCo2Ppm: true });
export const ZoneSetpoint = z.object({
  setpointTempC: z.number().min(0).max(45).optional(),
  setpointRhPct: z.number().min(0).max(100).optional(),
  setpointCo2Ppm: z.number().min(0).max(5000).optional(),
});
export type Zone = z.infer<typeof Zone>;
export type ZoneCreate = z.infer<typeof ZoneCreate>;
export type ZoneSetpoint = z.infer<typeof ZoneSetpoint>;
export type ZoneStatus = z.infer<typeof ZoneStatus>;

/* ── Bag (lifecycle) ────────────────────────────────────────── */
export const LifecycleStage = z.enum([
  "CREATED", "COLONIZING", "PINNING", "FRUITING", "HARVESTED", "CONTAMINATED", "DISPOSED",
]);
export const Bag = z.object({
  id,
  code,
  strainId: id,
  zoneId: id,
  status: LifecycleStage,
  stageProgress: z.number().min(0).max(1).default(0),
  weightG: z.number().nonnegative().nullable().default(null),
  substrate: shortText.default(""),              // e.g. Sawdust, Paddy straw, Coir pith
  substrateWeightKg: z.number().nonnegative().default(0),
  inoculatedOn: dateStr,
  expectedHarvest: dateStr,
  flushCount: count,                             // harvest flushes taken
  contaminationCause: shortText.default(""),     // Trichoderma / bacterial blotch / cobweb …
  notes,
  createdAt: ISO,
});
export const BagCreate = Bag.omit({ id: true, createdAt: true })
  .partial({ stageProgress: true, weightG: true, substrate: true, substrateWeightKg: true, inoculatedOn: true, expectedHarvest: true, flushCount: true, notes: true });
export type Bag = z.infer<typeof Bag>;
export type BagCreate = z.infer<typeof BagCreate>;
export type LifecycleStage = z.infer<typeof LifecycleStage>;

/* ── Reading (time series) ──────────────────────────────────── */
export const Reading = z.object({
  id,
  zoneId: id,
  ts: ISO,
  tempC: z.number(),
  rhPct: z.number(),
  co2Ppm: z.number(),
  lightLux: z.number(),
});
export type Reading = z.infer<typeof Reading>;

/* ── Alert ──────────────────────────────────────────────────── */
export const AlertMetric = z.enum(["temp", "rh", "co2", "light", "offline"]);
export const AlertSeverity = z.enum(["warn", "critical"]);
export const Alert = z.object({
  id,
  zoneId: id,
  metric: AlertMetric,
  severity: AlertSeverity,
  value: z.string(),
  threshold: z.string(),
  createdAt: ISO,
  acknowledgedAt: ISO.nullable().default(null),
});
export type Alert = z.infer<typeof Alert>;
export type AlertMetric = z.infer<typeof AlertMetric>;
export type AlertSeverity = z.infer<typeof AlertSeverity>;

/* ── Lab: Culture ───────────────────────────────────────────── */
export const CultureStatus = z.enum(["active", "inactive", "archived", "quarantine", "extinct"]);
export const Kingdom = z.enum(["Archaebacteria", "Eubacteria", "Protista", "Fungi", "Plantae", "Animalia"]);
export const Culture = z.object({
  id,
  code,
  genus: z.string().min(1).max(120),
  species: z.string().min(1).max(120),
  commonName: shortText.default(""),
  strainCode: shortCode.default(""),
  kingdom: Kingdom,
  status: CultureStatus,
  contaminated: z.boolean().default(false),
  gen: z.number().int().nonnegative().default(1),
  stock: z.number().int().nonnegative().default(0),
  storageId: id.nullable().default(null),
  categoryId: id.nullable().default(null),
  intervalDays: z.number().int().positive().default(15),
  nextTransfer: ISO.nullable().default(null),
  createdAt: ISO,
});
export const CultureCreate = Culture.omit({ id: true, createdAt: true });
export type Culture = z.infer<typeof Culture>;
export type CultureCreate = z.infer<typeof CultureCreate>;
export type CultureStatus = z.infer<typeof CultureStatus>;
export type Kingdom = z.infer<typeof Kingdom>;

/* ── Lab: Storage location (tree) ───────────────────────────── */
export const StorageType = z.enum([
  "building", "room", "incubator", "refrigerator", "freezer", "ultra low freezer", "rack", "box", "shelf", "position",
]);
export const StorageLocation = z.object({
  id,
  parentId: id.nullable().default(null),
  name,
  type: StorageType,
  tempRange: shortCode.default(""),
});
export const StorageCreate = StorageLocation.omit({ id: true });
export type StorageLocation = z.infer<typeof StorageLocation>;
export type StorageCreate = z.infer<typeof StorageCreate>;
export type StorageType = z.infer<typeof StorageType>;

/* ── Lab: Category (tree) ───────────────────────────────────── */
export const Category = z.object({
  id,
  parentId: id.nullable().default(null),
  name,
});
export const CategoryCreate = Category.omit({ id: true });
export type Category = z.infer<typeof Category>;
export type CategoryCreate = z.infer<typeof CategoryCreate>;

/* ── Lab: Custom field ──────────────────────────────────────── */
export const CustomFieldType = z.enum(["Text", "Number", "Date", "Dropdown", "Long Text"]);
export const CustomField = z.object({
  id,
  label: name,
  type: CustomFieldType,
  required: z.boolean().default(false),
});
export const CustomFieldCreate = CustomField.omit({ id: true });
export type CustomField = z.infer<typeof CustomField>;
export type CustomFieldCreate = z.infer<typeof CustomFieldCreate>;
export type CustomFieldType = z.infer<typeof CustomFieldType>;

/* ── Audit ──────────────────────────────────────────────────── */
export const AuditEntry = z.object({
  id,
  ts: ISO,
  user: z.string(),
  table: z.string(),
  action: z.enum(["Created", "Updated", "Deleted"]),
  detail: z.string(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

/* ── Spawn production (passage chain MC → G1 → G2 → spawn → substrate) ── */
export const SpawnStage = z.enum([
  "MOTHER_CULTURE",   // agar plate / slant
  "LIQUID_CULTURE",   // LC in jar
  "GRAIN_G1",         // first grain spawn
  "GRAIN_G2",         // grain-to-grain expansion
  "SPAWN_MASTER",     // master / sawdust spawn ready to sell
  "SUBSTRATE_F1",     // fruiting substrate block
]);
export type SpawnStage = z.infer<typeof SpawnStage>;

export const SPAWN_STAGE_ORDER: SpawnStage[] = [
  "MOTHER_CULTURE", "LIQUID_CULTURE", "GRAIN_G1", "GRAIN_G2", "SPAWN_MASTER", "SUBSTRATE_F1",
];
export const SPAWN_STAGE_LABEL: Record<SpawnStage, string> = {
  MOTHER_CULTURE: "Mother culture",
  LIQUID_CULTURE: "Liquid culture",
  GRAIN_G1: "Grain spawn G1",
  GRAIN_G2: "Grain spawn G2",
  SPAWN_MASTER: "Master / sawdust spawn",
  SUBSTRATE_F1: "Substrate block F1",
};
/** Suggested base colonization days AT OPTIMUM (Oyster-calibrated; grower edits per batch). */
export const SPAWN_STAGE_BASE_DAYS: Record<SpawnStage, number> = {
  MOTHER_CULTURE: 8,
  LIQUID_CULTURE: 5,
  GRAIN_G1: 12,
  GRAIN_G2: 10,
  SPAWN_MASTER: 14,
  SUBSTRATE_F1: 16,
};

export const SpawnStatus = z.enum(["INOCULATED", "COLONIZING", "READY", "SOLD", "USED", "CONTAMINATED"]);
export type SpawnStatus = z.infer<typeof SpawnStatus>;

export const SpawnBatch = z.object({
  id,
  code,                                    // e.g. MC-OYS-001
  label: shortText.default(""),            // human name, e.g. "Culture A"
  strainId: id,
  stage: SpawnStage,
  parentId: id.nullable().default(null),   // lineage: which batch it was transferred from
  substrate: shortText.default(""),        // PDA agar / Sorghum grain / Sawdust …
  container: shortCode.default(""),        // Petri dish / Jar / Spawn bag
  quantity: count,                         // units produced
  zoneId: id.nullable().default(null),     // incubation zone → live climate for the ETA
  inoculatedOn: dateStr,
  expectedColonizationDays: z.number().int().positive().default(12), // base, at optimum
  status: SpawnStatus.default("INOCULATED"),
  buyer: shortText.default(""),            // who ordered (optional)
  contaminationCause: shortText.default(""),
  atRisk: z.boolean().default(false),      // a parent in the lineage was contaminated
  notes,
  createdAt: ISO,
});
export const SpawnBatchCreate = SpawnBatch.omit({ id: true, createdAt: true })
  .partial({ label: true, parentId: true, substrate: true, container: true, quantity: true, zoneId: true, status: true, buyer: true, contaminationCause: true, atRisk: true, notes: true });
export type SpawnBatch = z.infer<typeof SpawnBatch>;
export type SpawnBatchCreate = z.infer<typeof SpawnBatchCreate>;

/* ── Lifecycle helpers ──────────────────────────────────────── */
export const LIFECYCLE_ORDER: LifecycleStage[] = ["CREATED", "COLONIZING", "PINNING", "FRUITING", "HARVESTED"];

export * from "./colonization";
export * from "./protection";
export * from "./climate";
export * from "./planner";
