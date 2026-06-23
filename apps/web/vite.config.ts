import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// VITE_BASE is set in CI (GitHub Pages) to the repo subpath, e.g. "/parambhariya-systems/".
// Local dev leaves it unset → base "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: { port: 5173 },
  build: { outDir: "dist", target: "es2022" },
});
