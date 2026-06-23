import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@parambhariya/types": new URL("../../libs/types/src/index.ts", import.meta.url).pathname,
      "@parambhariya/ui": new URL("../../libs/ui/src/index.ts", import.meta.url).pathname,
    },
  },
});
