# Parambhariya Systems

Multi-tenant IoT precision-agriculture platform. Web dashboard for farm operators, wrapped as a PWA + Capacitor for iOS/Android.

```
apps/
  web/         # Vite + React 19 + TanStack Router + Tailwind 4 + Capacitor
libs/
  ui/          # @parambhariya/ui — tokens, primitives, patterns, layout, theme
```

## Quick start

```sh
pnpm install
pnpm dev            # runs apps/web on http://localhost:5173
pnpm build          # builds all packages
pnpm typecheck      # tsc across the workspace
```

## Mobile (Capacitor)

```sh
pnpm --filter @parambhariya/web cap:add:ios
pnpm --filter @parambhariya/web cap:add:android
pnpm ios            # build web, sync, open Xcode
pnpm android        # build web, sync, open Android Studio
```

## What's in `libs/ui`

- **tokens.css** — single source of truth (brand, surfaces, lifecycle palette, status, type scale, spacing, radii, shadows, z-index, motion, touch).
- **primitives** — Button, Card, Badge, Input, Label, Textarea, Select, Alert, Dialog, IconButton, Skeleton, Breadcrumb, VisuallyHidden.
- **patterns** — FormField, PageHeader, EmptyState, ErrorState, ConfirmDialog, MetricCard, DataList, ListSkeleton, DetailSkeleton.
- **layout** — AppShell, TopBar, Sidebar (desktop-only, 224px), BottomNav (mobile-only), Brand.
- **theme** — `applyTenantTheme(id)` rewrites `--brand-*` at runtime; `applyColorScheme("light" | "dark")` flips `data-theme`. Two presets: `mushroomai` (green) and `aquafarm` (blue).

Components are TS-strict, `forwardRef`, Radix-headless where keyboard/aria correctness matters (Dialog, Select, Label).

## Design contract

See [DECISIONS.md](./DECISIONS.md) for the spec → code map and intentional deviations.

- Focus is keyboard-visible only (`focus-visible:ring-2`).
- Touch targets ≥ 44px on coarse pointers (`--touch-min`).
- Critical sensor alerts render as full-width banners and **must not** be dismissible by tap-elsewhere.
- Lifecycle status (CREATED / COLONIZING / PINNING / FRUITING / HARVESTED / CONTAMINATED) renders verbatim in `Badge` — domain enum, not localized.
- Numbers pair value + unit with a space: `26.3 °C`. Em-dash `—` is "no reading."
- Brand color is runtime-mutable — never hardcode hex; use `bg-brand-*`.

## Screens

| Route                | Screen                            |
|----------------------|-----------------------------------|
| `/` or `/login`      | LoginScreen                       |
| `/dashboard`         | Today overview, zones, recent bags|
| `/farms`             | Farm list                         |
| `/farms/:farmId`     | Farm detail (zones + bags)        |
| `/zone/:zoneId`      | Zone live readings                |
| `/bag/:bagId`        | Bag lifecycle + details           |
| `/strains`           | Strain catalog                    |
| `/alerts`            | Active alerts + ack               |
| `/reports`           | Production rollup                 |
| `/flows`             | Kanban-style lifecycle pipeline   |
| `/settings`          | Tenant + theme switcher           |
