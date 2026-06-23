import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * SQLite via better-sqlite3 — production-grade for a single-node internal
 * monitoring service. Swap DATABASE_PATH to a mounted volume in prod.
 * To move to Postgres/Turso later, change this file + the drizzle dialect;
 * the repos and routes stay the same.
 */
export function createDb(path = process.env.DATABASE_PATH ?? "./data/parambhariya.db") {
  const sqlite = new Database(path === ":memory:" ? ":memory:" : path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  ensureSchema(sqlite);
  migrate(sqlite);
  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof createDb>;
export { schema };

/** Idempotent table creation — no migration tool needed for a single-node SQLite app. */
function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS strains (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, scientific TEXT NOT NULL DEFAULT '',
      optimal_temp_min REAL NOT NULL, optimal_temp_max REAL NOT NULL,
      optimal_rh_min REAL NOT NULL, optimal_rh_max REAL NOT NULL,
      optimal_co2_max REAL NOT NULL DEFAULT 1000,
      cycle_days INTEGER NOT NULL, colonization_days INTEGER NOT NULL DEFAULT 0,
      fruiting_days INTEGER NOT NULL DEFAULT 0, yield_kg REAL NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT '',
      area_sq_m REAL NOT NULL DEFAULT 0, bag_capacity INTEGER NOT NULL DEFAULT 0,
      manager TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', established_on TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, farm_id TEXT NOT NULL, name TEXT NOT NULL, purpose TEXT NOT NULL,
      size_sq_m REAL NOT NULL DEFAULT 0, bag_capacity INTEGER NOT NULL DEFAULT 0,
      rack_count INTEGER NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY, room_id TEXT NOT NULL, name TEXT NOT NULL,
      bag_capacity INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL DEFAULT '',
      setpoint_temp_c REAL NOT NULL DEFAULT 24, setpoint_rh_pct REAL NOT NULL DEFAULT 88,
      setpoint_co2_ppm REAL NOT NULL DEFAULT 1000,
      temp_c REAL, rh_pct REAL, co2_ppm REAL, light_lux REAL,
      status TEXT NOT NULL DEFAULT 'OK', updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS bags (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, strain_id TEXT NOT NULL, zone_id TEXT NOT NULL,
      status TEXT NOT NULL, stage_progress REAL NOT NULL DEFAULT 0, weight_g REAL,
      substrate TEXT NOT NULL DEFAULT '', substrate_weight_kg REAL NOT NULL DEFAULT 0,
      inoculated_on TEXT NOT NULL DEFAULT '', expected_harvest TEXT NOT NULL DEFAULT '',
      flush_count INTEGER NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS spawn_batches (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', strain_id TEXT NOT NULL,
      stage TEXT NOT NULL, parent_id TEXT, substrate TEXT NOT NULL DEFAULT '', container TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 0, zone_id TEXT, inoculated_on TEXT NOT NULL DEFAULT '',
      expected_colonization_days INTEGER NOT NULL DEFAULT 12, status TEXT NOT NULL DEFAULT 'INOCULATED',
      buyer TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS readings (
      id TEXT PRIMARY KEY, zone_id TEXT NOT NULL, ts TEXT NOT NULL,
      temp_c REAL NOT NULL, rh_pct REAL NOT NULL, co2_ppm REAL NOT NULL, light_lux REAL NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_readings_zone_ts ON readings (zone_id, ts);
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY, zone_id TEXT NOT NULL, metric TEXT NOT NULL, severity TEXT NOT NULL,
      value TEXT NOT NULL, threshold TEXT NOT NULL, created_at TEXT NOT NULL, acknowledged_at TEXT
    );
    CREATE TABLE IF NOT EXISTS cultures (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, genus TEXT NOT NULL, species TEXT NOT NULL,
      common_name TEXT NOT NULL DEFAULT '', strain_code TEXT NOT NULL DEFAULT '', kingdom TEXT NOT NULL,
      status TEXT NOT NULL, contaminated INTEGER NOT NULL DEFAULT 0, gen INTEGER NOT NULL DEFAULT 1,
      stock INTEGER NOT NULL DEFAULT 0, storage_id TEXT, category_id TEXT,
      interval_days INTEGER NOT NULL DEFAULT 15, next_transfer TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS storage_locations (
      id TEXT PRIMARY KEY, parent_id TEXT, name TEXT NOT NULL, type TEXT NOT NULL, temp_range TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY, parent_id TEXT, name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS custom_fields (
      id TEXT PRIMARY KEY, label TEXT NOT NULL, type TEXT NOT NULL, required INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS audit_entries (
      id TEXT PRIMARY KEY, ts TEXT NOT NULL, user TEXT NOT NULL, table_name TEXT NOT NULL,
      action TEXT NOT NULL, detail TEXT NOT NULL
    );
  `);
}

/**
 * Additive migration: brings a pre-existing DB up to the current column set.
 * Each entry is (table, column, "TYPE NOT NULL DEFAULT ..."). ALTER TABLE ADD
 * COLUMN is a no-op error if the column already exists, so we swallow it.
 * SQLite only ever adds columns here — never drops/renames — so it is safe.
 */
function migrate(sqlite: Database.Database) {
  const additions: [string, string, string][] = [
    ["strains", "optimal_co2_max", "REAL NOT NULL DEFAULT 1000"],
    ["strains", "colonization_days", "INTEGER NOT NULL DEFAULT 0"],
    ["strains", "fruiting_days", "INTEGER NOT NULL DEFAULT 0"],
    ["strains", "supplier", "TEXT NOT NULL DEFAULT ''"],
    ["strains", "notes", "TEXT NOT NULL DEFAULT ''"],
    ["farms", "area_sq_m", "REAL NOT NULL DEFAULT 0"],
    ["farms", "bag_capacity", "INTEGER NOT NULL DEFAULT 0"],
    ["farms", "manager", "TEXT NOT NULL DEFAULT ''"],
    ["farms", "phone", "TEXT NOT NULL DEFAULT ''"],
    ["farms", "established_on", "TEXT NOT NULL DEFAULT ''"],
    ["rooms", "size_sq_m", "REAL NOT NULL DEFAULT 0"],
    ["rooms", "bag_capacity", "INTEGER NOT NULL DEFAULT 0"],
    ["rooms", "rack_count", "INTEGER NOT NULL DEFAULT 0"],
    ["rooms", "notes", "TEXT NOT NULL DEFAULT ''"],
    ["zones", "bag_capacity", "INTEGER NOT NULL DEFAULT 0"],
    ["zones", "device_id", "TEXT NOT NULL DEFAULT ''"],
    ["bags", "substrate", "TEXT NOT NULL DEFAULT ''"],
    ["bags", "substrate_weight_kg", "REAL NOT NULL DEFAULT 0"],
    ["bags", "inoculated_on", "TEXT NOT NULL DEFAULT ''"],
    ["bags", "expected_harvest", "TEXT NOT NULL DEFAULT ''"],
    ["bags", "flush_count", "INTEGER NOT NULL DEFAULT 0"],
    ["bags", "notes", "TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [table, col, def] of additions) {
    const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === col)) {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    }
  }
}
