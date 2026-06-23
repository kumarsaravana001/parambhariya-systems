import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const strains = sqliteTable("strains", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  scientific: text("scientific").notNull().default(""),
  optimalTempMin: real("optimal_temp_min").notNull(),
  optimalTempMax: real("optimal_temp_max").notNull(),
  optimalRhMin: real("optimal_rh_min").notNull(),
  optimalRhMax: real("optimal_rh_max").notNull(),
  cycleDays: integer("cycle_days").notNull(),
  yieldKg: real("yield_kg").notNull().default(0),
});

export const farms = sqliteTable("farms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
});

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  farmId: text("farm_id").notNull(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
});

export const zones = sqliteTable("zones", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  name: text("name").notNull(),
  setpointTempC: real("setpoint_temp_c").notNull().default(24),
  setpointRhPct: real("setpoint_rh_pct").notNull().default(88),
  setpointCo2Ppm: real("setpoint_co2_ppm").notNull().default(1000),
  tempC: real("temp_c"),
  rhPct: real("rh_pct"),
  co2Ppm: real("co2_ppm"),
  lightLux: real("light_lux"),
  status: text("status").notNull().default("OK"),
  updatedAt: text("updated_at"),
});

export const bags = sqliteTable("bags", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  strainId: text("strain_id").notNull(),
  zoneId: text("zone_id").notNull(),
  status: text("status").notNull(),
  stageProgress: real("stage_progress").notNull().default(0),
  weightG: real("weight_g"),
  createdAt: text("created_at").notNull(),
});

export const readings = sqliteTable("readings", {
  id: text("id").primaryKey(),
  zoneId: text("zone_id").notNull(),
  ts: text("ts").notNull(),
  tempC: real("temp_c").notNull(),
  rhPct: real("rh_pct").notNull(),
  co2Ppm: real("co2_ppm").notNull(),
  lightLux: real("light_lux").notNull(),
});

export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  zoneId: text("zone_id").notNull(),
  metric: text("metric").notNull(),
  severity: text("severity").notNull(),
  value: text("value").notNull(),
  threshold: text("threshold").notNull(),
  createdAt: text("created_at").notNull(),
  acknowledgedAt: text("acknowledged_at"),
});

export const cultures = sqliteTable("cultures", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  genus: text("genus").notNull(),
  species: text("species").notNull(),
  commonName: text("common_name").notNull().default(""),
  strainCode: text("strain_code").notNull().default(""),
  kingdom: text("kingdom").notNull(),
  status: text("status").notNull(),
  contaminated: integer("contaminated", { mode: "boolean" }).notNull().default(false),
  gen: integer("gen").notNull().default(1),
  stock: integer("stock").notNull().default(0),
  storageId: text("storage_id"),
  categoryId: text("category_id"),
  intervalDays: integer("interval_days").notNull().default(15),
  nextTransfer: text("next_transfer"),
  createdAt: text("created_at").notNull(),
});

export const storageLocations = sqliteTable("storage_locations", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  type: text("type").notNull(),
  tempRange: text("temp_range").notNull().default(""),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
});

export const customFields = sqliteTable("custom_fields", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  type: text("type").notNull(),
  required: integer("required", { mode: "boolean" }).notNull().default(false),
});

export const auditEntries = sqliteTable("audit_entries", {
  id: text("id").primaryKey(),
  ts: text("ts").notNull(),
  user: text("user").notNull(),
  table: text("table_name").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
});
