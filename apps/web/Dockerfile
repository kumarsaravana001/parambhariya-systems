# ── build stage ──────────────────────────────────────────────
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY libs/types/package.json libs/types/
COPY libs/ui/package.json libs/ui/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @parambhariya/web...

COPY libs libs
COPY apps/web apps/web
RUN pnpm --filter @parambhariya/web build

# ── runtime: nginx serving the static SPA ────────────────────
FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
