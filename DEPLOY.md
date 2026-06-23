# Deploy

The system is two deployables: a stateful **API** (`apps/api`) and a static **web** SPA (`apps/web`).

## Architecture in one line
`apps/web` talks to a data **driver**. With `VITE_API_URL` set it uses the real API (REST + Server-Sent-Events live readings + backend temperature control). Unset, it falls back to a browser-persistent driver (localStorage + a client-side control simulator) — that's what the public GitHub Pages demo runs, so the demo is still fully dynamic and live with no server.

## Local — full stack
```sh
pnpm install
pnpm dev:full          # API on :8787, web on :5173
# then in apps/web/.env.local:  VITE_API_URL=http://localhost:8787
```
Or run them separately: `pnpm dev:api` and `pnpm dev` (web alone uses the demo driver).

## Docker (self-host both)
```sh
docker compose up --build
# web → http://localhost:8080   api → http://localhost:8787
```
SQLite persists in the `api-data` volume.

## API to a managed host
- **Fly.io** (config in `apps/api/fly.toml`, region `maa` = Chennai):
  ```sh
  cd apps/api
  fly launch --no-deploy
  fly volumes create api_data --size 1
  fly deploy
  ```
- **Render** (`render.yaml` blueprint): connect the repo, deploy. A 1 GB disk is mounted at `/data`. After the API is up, set `VITE_API_URL` on the web service to the API URL and redeploy.

## Web to GitHub Pages (current demo)
Already wired: pushing to `main` runs `.github/workflows/deploy.yml`, which builds with `VITE_BASE=/parambhariya-systems/` (no `VITE_API_URL`, so the demo driver is used) and publishes to Pages. To make the Pages build hit a real API, add `VITE_API_URL` as a repo variable and reference it in that workflow's build env.

## Env vars
| Var | Where | Default | Meaning |
|---|---|---|---|
| `PORT` | api | `8787` | HTTP port |
| `DATABASE_PATH` | api | `./data/parambhariya.db` | SQLite file (`:memory:` for ephemeral) |
| `LOOP_INTERVAL_MS` | api | `3000` | control-loop tick interval |
| `VITE_API_URL` | web build | _(unset)_ | API base URL; unset → demo driver |
| `VITE_BASE` | web build | `/` | base path for subpath hosting |

## CI
`.github/workflows/ci.yml` runs typecheck + tests + build and a Docker image build for the API on every push/PR.

## Production notes (honest)
- SQLite + a mounted volume is genuinely production-grade for this single-node internal tool. To scale out, swap the Drizzle driver in `apps/api/src/db/index.ts` to Postgres/Turso — the repos and routes don't change.
- The control loop's `stepZone` is a **simulator**. Replacing it with a real edge-device driver (read sensor, command actuator) is the one seam to wire for physical hardware; alerts, persistence, SSE, and the UI all stay the same.
- No auth yet. Put the API behind your network / an auth proxy before exposing it, or add a token middleware in `apps/api/src/app.ts`.
