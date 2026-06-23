# ── build stage ──────────────────────────────────────────────
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

# better-sqlite3 needs build tools if no prebuilt binary matches
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# workspace manifests first for cached installs
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY libs/types/package.json libs/types/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @parambhariya/api...

# sources
COPY libs/types libs/types
COPY apps/api apps/api
RUN pnpm --filter @parambhariya/api build

# prune to production deps
RUN pnpm --filter @parambhariya/api --prod deploy /out

# ── runtime stage ────────────────────────────────────────────
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/dist ./dist
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/package.json ./package.json

ENV PORT=8787
ENV DATABASE_PATH=/data/parambhariya.db
VOLUME /data
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
