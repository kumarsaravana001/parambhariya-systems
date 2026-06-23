import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    pool: "forks", // better-sqlite3 native module is happiest one-process-per-file
  },
  resolve: {
    alias: {
      "@parambhariya/types": new URL("../../libs/types/src/index.ts", import.meta.url).pathname,
    },
  },
});
