import { describe, it, expect, afterEach } from "vitest";
import Database from "better-sqlite3";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync } from "node:fs";
import { createDb, schema } from "./db/index.js";

const path = join(tmpdir(), `parambhariya-mig-${Date.now()}.db`);
afterEach(() => { for (const ext of ["", "-wal", "-shm"]) rmSync(path + ext, { force: true }); });

describe("additive migration", () => {
  it("adds new columns to a pre-existing old-schema DB and preserves rows", () => {
    // simulate a v1 database: farms/bags without the new operational columns
    const old = new Database(path);
    old.exec("CREATE TABLE farms (id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT '')");
    old.prepare("INSERT INTO farms (id,name,location) VALUES (?,?,?)").run("f-old", "Legacy Farm", "Anaimalai");
    old.close();

    // opening through createDb runs ensureSchema (no-op for existing table) + migrate
    const db = createDb(path);
    const cols = (db as any).$client.prepare("PRAGMA table_info(farms)").all().map((c: any) => c.name);
    for (const c of ["area_sq_m", "bag_capacity", "manager", "phone", "established_on"]) {
      expect(cols).toContain(c);
    }
    // existing row is preserved, new columns default sensibly
    const rows = db.select().from(schema.farms).all();
    const f = rows.find((r) => r.id === "f-old")!;
    expect(f.name).toBe("Legacy Farm");
    expect(f.bagCapacity).toBe(0);
    expect(f.manager).toBe("");
  });
});
