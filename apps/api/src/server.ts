import { serve } from "@hono/node-server";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createDb } from "./db/index.js";
import { createApp } from "./app.js";
import { startLoop } from "./loop.js";
import { seed } from "./seed.js";

const PORT = Number(process.env.PORT ?? 8787);
const DB_PATH = process.env.DATABASE_PATH ?? "./data/parambhariya.db";
const LOOP_MS = Number(process.env.LOOP_INTERVAL_MS ?? 3000);

if (DB_PATH !== ":memory:") mkdirSync(dirname(DB_PATH), { recursive: true });

const db = createDb(DB_PATH);
const seeded = seed(db);
const app = createApp(db);
const stop = startLoop(db, LOOP_MS);

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Parambhariya API on http://localhost:${info.port}  (db: ${DB_PATH}, ${seeded ? "seeded" : "existing"}, loop ${LOOP_MS}ms)`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => { stop(); server.close(); process.exit(0); });
}
