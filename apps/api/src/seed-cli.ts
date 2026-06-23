import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createDb } from "./db/index.js";
import { seed } from "./seed.js";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/parambhariya.db";
if (DB_PATH !== ":memory:") mkdirSync(dirname(DB_PATH), { recursive: true });
const did = seed(createDb(DB_PATH));
console.log(did ? "Seeded." : "Already seeded — no changes.");
