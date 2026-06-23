import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Db } from "./db/index.js";
import { schema } from "./db/index.js";
import { broadcast } from "./bus.js";
import { stepZone, evaluateAlerts, statusFromAlerts, type ZoneReadingState } from "./control.js";

const READING_RETENTION = 240; // keep last N readings per zone

/** One control tick across all zones: drive readings, persist, alert, broadcast. */
export function tick(db: Db, tickNo: number, now = new Date()) {
  const ts = now.toISOString();
  const zones = db.select().from(schema.zones).all();

  for (const z of zones) {
    const prev: ZoneReadingState | null =
      z.tempC != null && z.rhPct != null && z.co2Ppm != null && z.lightLux != null
        ? { tempC: z.tempC, rhPct: z.rhPct, co2Ppm: z.co2Ppm, lightLux: z.lightLux }
        : null;

    const r = stepZone(z, prev, tickNo);
    const candidates = evaluateAlerts(z, r);
    const status = statusFromAlerts(candidates);

    // persist reading
    db.insert(schema.readings).values({ id: nanoid(), zoneId: z.id, ts, ...r }).run();

    // update zone latest + status
    db.update(schema.zones)
      .set({ tempC: r.tempC, rhPct: r.rhPct, co2Ppm: r.co2Ppm, lightLux: r.lightLux, status, updatedAt: ts })
      .where(eq(schema.zones.id, z.id))
      .run();

    // reconcile alerts: open new ones, resolve cleared ones (one open alert per metric)
    const open = db.select().from(schema.alerts).where(eq(schema.alerts.zoneId, z.id)).all()
      .filter((a) => a.acknowledgedAt == null);
    for (const cand of candidates) {
      const existing = open.find((a) => a.metric === cand.metric);
      if (!existing) {
        db.insert(schema.alerts).values({
          id: nanoid(), zoneId: z.id, metric: cand.metric, severity: cand.severity,
          value: cand.value, threshold: cand.threshold, createdAt: ts, acknowledgedAt: null,
        }).run();
      } else if (existing.severity !== cand.severity || existing.value !== cand.value) {
        db.update(schema.alerts)
          .set({ severity: cand.severity, value: cand.value, threshold: cand.threshold })
          .where(eq(schema.alerts.id, existing.id)).run();
      }
    }
    // auto-resolve open alerts whose metric is no longer firing
    for (const a of open) {
      if (!candidates.find((c) => c.metric === a.metric)) {
        db.update(schema.alerts).set({ acknowledgedAt: ts }).where(eq(schema.alerts.id, a.id)).run();
      }
    }

    broadcast("reading", { zoneId: z.id, ts, status, ...r });
  }

  // trim old readings per zone
  for (const z of zones) {
    const ids = db.select({ id: schema.readings.id }).from(schema.readings)
      .where(eq(schema.readings.zoneId, z.id)).all().map((x) => x.id);
    if (ids.length > READING_RETENTION) {
      const toDelete = ids.slice(0, ids.length - READING_RETENTION);
      for (const rid of toDelete) db.delete(schema.readings).where(eq(schema.readings.id, rid)).run();
    }
  }
}

/** Start the interval loop; returns a stop fn. */
export function startLoop(db: Db, intervalMs = 3000) {
  let n = 0;
  const timer = setInterval(() => {
    try { tick(db, n++); } catch (e) { console.error("[loop] tick failed", e); }
  }, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
