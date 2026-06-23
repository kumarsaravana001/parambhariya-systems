import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { streamSSE } from "hono/streaming";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z, type AnyZodObject } from "zod";
import * as T from "@parambhariya/types";
import type { Db } from "./db/index.js";
import { schema } from "./db/index.js";
import { subscribe } from "./bus.js";
import { tick } from "./loop.js";

type AnyTable = any;

function audit(db: Db, table: string, action: "Created" | "Updated" | "Deleted", detail: string) {
  db.insert(schema.auditEntries).values({
    id: nanoid(), ts: new Date().toISOString(), user: "system", table, action, detail,
  }).run();
}

/** Registers list/get/create/update/delete for a table validated by Zod. */
function crud(
  app: Hono,
  path: string,
  table: AnyTable,
  createSchema: AnyZodObject,
  db: Db,
  opts: { name: string; label?: (row: any) => string; onCreate?: (input: any) => any } = { name: path },
) {
  const label = opts.label ?? ((r: any) => r.name ?? r.code ?? r.label ?? r.id);

  app.get(path, (c) => c.json(db.select().from(table).all()));

  app.get(`${path}/:id`, (c) => {
    const row = db.select().from(table).where(eq(table.id, c.req.param("id"))).get();
    return row ? c.json(row) : c.json({ error: "Not found" }, 404);
  });

  app.post(path, async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
    const row = { id: nanoid(), ...(opts.onCreate ? opts.onCreate(parsed.data) : parsed.data) };
    db.insert(table).values(row).run();
    audit(db, opts.name, "Created", label(row));
    return c.json(row, 201);
  });

  app.patch(`${path}/:id`, async (c) => {
    const idv = c.req.param("id");
    const existing = db.select().from(table).where(eq(table.id, idv)).get();
    if (!existing) return c.json({ error: "Not found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const parsed = createSchema.partial().safeParse(body);
    if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
    if (Object.keys(parsed.data).length === 0) return c.json({ error: "No fields to update" }, 400);
    db.update(table).set(parsed.data as any).where(eq(table.id, idv)).run();
    const row = db.select().from(table).where(eq(table.id, idv)).get();
    audit(db, opts.name, "Updated", label(row));
    return c.json(row);
  });

  app.delete(`${path}/:id`, (c) => {
    const idv = c.req.param("id");
    const existing = db.select().from(table).where(eq(table.id, idv)).get();
    if (!existing) return c.json({ error: "Not found" }, 404);
    db.delete(table).where(eq(table.id, idv)).run();
    audit(db, opts.name, "Deleted", label(existing));
    return c.json({ ok: true });
  });
}

export function createApp(db: Db) {
  const app = new Hono();
  app.use("*", cors());
  // reject oversized bodies before parsing (defense-in-depth; this is an internal tool)
  app.use("*", bodyLimit({ maxSize: 256 * 1024 }));

  app.get("/", (c) => c.json({ name: "Parambhariya API", ok: true }));
  app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

  // ── Farm domain ──────────────────────────────────────────────
  crud(app, "/strains", schema.strains, T.StrainCreate, db, { name: "Strains" });
  crud(app, "/farms", schema.farms, T.FarmCreate, db, { name: "Farms" });
  crud(app, "/rooms", schema.rooms, T.RoomCreate, db, { name: "Rooms" });
  crud(app, "/zones", schema.zones, T.ZoneCreate, db, {
    name: "Zones",
    onCreate: (d) => ({ ...d, tempC: null, rhPct: null, co2Ppm: null, lightLux: null, status: "OK", updatedAt: null }),
  });
  crud(app, "/bags", schema.bags, T.BagCreate, db, {
    name: "Bags",
    label: (r) => r.code,
    onCreate: (d) => ({ stageProgress: 0, weightG: null, contaminationCause: "", ...d, createdAt: new Date().toISOString() }),
  });
  crud(app, "/spawn", schema.spawnBatches, T.SpawnBatchCreate, db, {
    name: "Spawn",
    label: (r) => r.code,
    onCreate: (d) => ({ label: "", parentId: null, substrate: "", container: "", quantity: 0, zoneId: null, status: "INOCULATED", buyer: "", contaminationCause: "", atRisk: false, notes: "", ...d, createdAt: new Date().toISOString() }),
  });

  // zone setpoint (the temperature-control write path)
  app.patch("/zones/:id/setpoint", async (c) => {
    const idv = c.req.param("id");
    const zone = db.select().from(schema.zones).where(eq(schema.zones.id, idv)).get();
    if (!zone) return c.json({ error: "Not found" }, 404);
    const parsed = T.ZoneSetpoint.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
    if (Object.keys(parsed.data).length === 0) return c.json({ error: "No setpoint fields to update" }, 400);
    db.update(schema.zones).set(parsed.data).where(eq(schema.zones.id, idv)).run();
    const row = db.select().from(schema.zones).where(eq(schema.zones.id, idv)).get();
    audit(db, "Zones", "Updated", `${row?.name} setpoint`);
    return c.json(row);
  });

  // zone readings (time series)
  app.get("/zones/:id/readings", (c) => {
    const limit = Math.min(Number(c.req.query("limit") ?? 60), 240);
    const rows = db.select().from(schema.readings)
      .where(eq(schema.readings.zoneId, c.req.param("id")))
      .orderBy(desc(schema.readings.ts)).limit(limit).all();
    return c.json(rows.reverse());
  });

  // ── Alerts ───────────────────────────────────────────────────
  app.get("/alerts", (c) => {
    const open = c.req.query("open");
    let rows = db.select().from(schema.alerts).orderBy(desc(schema.alerts.createdAt)).all();
    if (open === "1") rows = rows.filter((a) => a.acknowledgedAt == null);
    return c.json(rows);
  });
  app.post("/alerts/:id/ack", (c) => {
    const idv = c.req.param("id");
    const a = db.select().from(schema.alerts).where(eq(schema.alerts.id, idv)).get();
    if (!a) return c.json({ error: "Not found" }, 404);
    db.update(schema.alerts).set({ acknowledgedAt: new Date().toISOString() }).where(eq(schema.alerts.id, idv)).run();
    return c.json(db.select().from(schema.alerts).where(eq(schema.alerts.id, idv)).get());
  });

  // ── Lab domain ───────────────────────────────────────────────
  crud(app, "/cultures", schema.cultures, T.CultureCreate, db, {
    name: "Cultures", label: (r) => r.code,
    onCreate: (d) => ({ contaminated: false, gen: 1, stock: 0, storageId: null, categoryId: null, intervalDays: 15, nextTransfer: null, commonName: "", strainCode: "", ...d, createdAt: new Date().toISOString() }),
  });
  crud(app, "/storage", schema.storageLocations, T.StorageCreate, db, { name: "Storage", onCreate: (d) => ({ parentId: null, tempRange: "", ...d }) });
  crud(app, "/categories", schema.categories, T.CategoryCreate, db, { name: "Categories", onCreate: (d) => ({ parentId: null, ...d }) });
  crud(app, "/custom-fields", schema.customFields, T.CustomFieldCreate, db, { name: "Custom Fields", label: (r) => r.label, onCreate: (d) => ({ required: false, ...d }) });

  app.get("/audit", (c) => c.json(db.select().from(schema.auditEntries).orderBy(desc(schema.auditEntries.ts)).limit(200).all()));

  // ── Dashboard summary (server-computed KPIs) ─────────────────
  app.get("/summary", (c) => {
    const farms = db.select().from(schema.farms).all();
    const rooms = db.select().from(schema.rooms).all();
    const zones = db.select().from(schema.zones).all();
    const bags = db.select().from(schema.bags).all();
    const strains = db.select().from(schema.strains).all();
    const openAlerts = db.select().from(schema.alerts).all().filter((a) => a.acknowledgedAt == null);
    const active = bags.filter((b) => !["HARVESTED", "CONTAMINATED", "DISPOSED"].includes(b.status));
    const harvested = bags.filter((b) => b.status === "HARVESTED");
    const contaminated = bags.filter((b) => b.status === "CONTAMINATED");
    const yieldKg = bags.reduce((s, b) => s + (b.weightG ?? 0), 0) / 1000;
    return c.json({
      farms: farms.length, rooms: rooms.length, zones: zones.length, strains: strains.length,
      bagsTotal: bags.length, bagsActive: active.length, bagsHarvested: harvested.length, bagsContaminated: contaminated.length,
      yieldKg: Math.round(yieldKg * 100) / 100,
      openAlerts: openAlerts.length, criticalAlerts: openAlerts.filter((a) => a.severity === "critical").length,
      zonesAlarm: zones.filter((z) => z.status === "ALARM").length,
      zonesWarn: zones.filter((z) => z.status === "WARN").length,
      successRate: bags.length ? Math.round(((bags.length - contaminated.length) / bags.length) * 100) : 100,
    });
  });

  // ── SSE live stream ──────────────────────────────────────────
  app.get("/events", (c) =>
    streamSSE(c, async (stream) => {
      const unsub = subscribe((event, data) => {
        stream.writeSSE({ event, data: JSON.stringify(data) }).catch(() => {});
      });
      await stream.writeSSE({ event: "hello", data: JSON.stringify({ ok: true }) });
      // keepalive + hold open until client disconnects
      while (!stream.aborted) {
        await stream.sleep(15000);
        await stream.writeSSE({ event: "ping", data: JSON.stringify({ t: Date.now() }) }).catch(() => {});
      }
      unsub();
    }),
  );

  // dev/test helper: force a control tick on demand — never registered in production
  if (process.env.NODE_ENV !== "production") {
    app.post("/_tick", (c) => { tick(db, Math.floor(Math.random() * 1000)); return c.json({ ok: true }); });
  }

  return app;
}
