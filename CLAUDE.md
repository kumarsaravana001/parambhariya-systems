# CLAUDE.md — Parambhariya Systems

Monorepo for the Parambhariya farm platform. `apps/web` (Vite + React 19 + TanStack Router + Tailwind 4 + Capacitor) consuming `libs/ui` (`@parambhariya/ui`).

## Design System
Always read `DESIGN.md` before making any visual or UI decision. All fonts, colors, spacing, radii, motion, and aesthetic direction are defined there and are **locked** — tokens are law. Do not deviate or "improve" the look without explicit user approval. The lifecycle palette and the rule "red means contamination only" are domain-critical — never redesign them. In QA/review, flag any code that hardcodes hex, uses brand-500 as text (use brand-700), or makes a critical alert dismissible.

## Build & run
- `pnpm install` then `pnpm dev` → http://localhost:5173
- `pnpm --filter @parambhariya/web build` (runs `tsr generate && tsc --noEmit && vite build`)
- `pnpm --filter @parambhariya/ui typecheck`
- Route tree is generated; after adding a route under `apps/web/src/routes/`, the dev server or `tsr generate` regenerates `routeTree.gen.ts`.

## Conventions
- Components: TS-strict, `forwardRef`, Radix headless where keyboard/aria correctness matters (Dialog, Select, Combobox, Tabs, Tooltip, Popover, DropdownMenu, Checkbox, Radio, Switch, Slider).
- Styling: Tailwind 4 utilities mapped from tokens. `libs/ui/src/styles/index.css` holds the `@theme` map and `@source` globs (Tailwind does not cross workspace package boundaries — new source dirs need an `@source` line).
- Numbers pair value + space + unit (`26.3 °C`). Em-dash `—` is the no-reading placeholder.
- Mock data lives in `apps/web/src/data/mock.ts` (farm → room → zone → bag). Swap for tRPC when `apps/api` lands.
