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
      cycle_days INTEGER NOT NULL, yield_kg REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, farm_id TEXT NOT NULL, name TEXT NOT NULL, purpose TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY, room_id TEXT NOT NULL, name TEXT NOT NULL,
      setpoint_temp_c REAL NOT NULL DEFAULT 24, setpoint_rh_pct REAL NOT NULL DEFAULT 88,
      setpoint_co2_ppm REAL NOT NULL DEFAULT 1000,
      temp_c REAL, rh_pct REAL, co2_ppm REAL, light_lux REAL,
      status TEXT NOT NULL DEFAULT 'OK', updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS bags (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, strain_id TEXT NOT NULL, zone_id TEXT NOT NULL,
      status TEXT NOT NULL, stage_progress REAL NOT NULL DEFAULT 0, weight_g REAL, created_at TEXT NOT NULL
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
