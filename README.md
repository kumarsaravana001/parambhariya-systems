# Parambhariya Systems

Production-ready monitoring platform for Parambhariya mushroom cultivation — live environment monitoring, backend-driven temperature/humidity/CO₂ control, full lifecycle tracking (farm → room → zone → bag), and an internal lab portal for microbial cultures.

```
apps/
  api/         Hono + Drizzle + SQLite backend — REST CRUD, SSE live readings,
               temperature CONTROL LOOP with per-zone setpoints, alerts, seed
  web/         Vite + React 19 + TanStack Router + Tailwind 4 + Capacitor SPA
libs/
  types/       @parambhariya/types — Zod schemas + TS types shared by api & web
  ui/          @parambhariya/ui — design system (tokens, ~50 primitives/patterns)
```

## Quick start
```sh
pnpm install
pnpm dev:full        # API on :8787, web on :5173
pnpm test            # 31 tests (api control loop + CRUD, web data layer + forms)
pnpm typecheck       # all packages
pnpm build           # all packages
```
- `apps/web/.env.local` → `VITE_API_URL=http://localhost:8787` to use the real backend.
- Without `VITE_API_URL`, the web app uses a **browser-persistent demo driver** (localStorage + a client-side control simulator) — fully dynamic and live with no server. That's how the public GitHub Pages demo runs.

## How it works

**Everything is dynamic.** Every list reads from a data layer; every entity (farms, rooms, zones, bags, strains, cultures, storage, categories, custom fields) has create / edit / delete forms. Server state is managed by TanStack Query with cache invalidation.

**Temperature control is backend-driven.** Each zone holds a setpoint (temp / humidity / CO₂). A control loop (`apps/api/src/control.ts` + `loop.ts`) drives each measured value toward its setpoint every tick, persists a time-series reading, and raises/auto-resolves alerts on deviation. The UI's setpoint sliders `PATCH /zones/:id/setpoint`; readings stream live over Server-Sent Events. `stepZone` is the simulation driver — the one seam where a real edge-device driver drops in.

**Two drivers, one UI.** `apps/web/src/lib/driver.ts` picks the HTTP driver (real API) or the localStorage driver (demo) at runtime by `VITE_API_URL`. Both implement the same `Driver` interface and the same control law.

## Live demo
**https://kumarsaravana001.github.io/parambhariya-systems/** (runs the browser demo driver — dynamic + live, no backend).

## Deploy
See [DEPLOY.md](./DEPLOY.md). API → Docker / Fly.io (`apps/api/fly.toml`, Chennai region) / Render (`render.yaml`) with a persistent SQLite volume; web → GitHub Pages or any static host / nginx (`apps/web/Dockerfile`). `docker compose up --build` runs both. CI (`.github/workflows/ci.yml`) runs typecheck + tests + build + an API image build on every push.

## Design system
See [DESIGN.md](./DESIGN.md) — the locked Parambhariya visual system (tokens are law). `/components` in the app is a live gallery of every primitive and pattern. Lab portal ideas captured in [docs/CBM-LAB-PORTAL.md](./docs/CBM-LAB-PORTAL.md).

## Screens
Operations dashboard (live KPIs + fleet + alerts + pipeline) · Farms / Rooms / Zones / Bags (CRUD + live + setpoint control) · Strains · Alerts · Reports · Flows (kanban) · Lab Portal (cultures, storage tree, categories, custom fields, audit) · Components gallery · Settings.

## Honest production notes
- SQLite + a mounted volume is genuinely production-grade for this single-node internal tool; swap the Drizzle driver to Postgres/Turso to scale out (repos/routes unchanged).
- The control loop simulates the actuator. Wiring real sensors/actuators is the `stepZone` seam; persistence, alerts, SSE, and UI stay the same.
- No auth yet — put the API behind your network or add a token middleware before exposing it.
