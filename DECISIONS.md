# Decisions

How the handoff bundle maps to this implementation, and where it diverges.

## Architecture

| Spec (EXPORT.md)                          | Implementation                                       | Why |
|-------------------------------------------|------------------------------------------------------|-----|
| Nx workspace                              | **pnpm workspace** with `apps/*` + `libs/*`          | Same shape, zero install drama. Nx CLI can be layered on later (`pnpm add -Dw nx`) without restructuring. |
| TanStack Start                            | **Vite + TanStack Router (file-based)**              | TanStack Start (the full SSR meta-framework) is still in beta and overkill for a Capacitor-wrapped PWA. Router gives 90% of the value (file-based routes, type-safe links, preload-on-intent) on top of a stable Vite SPA — and the SPA build is what Capacitor wants. |
| React 19, Tailwind 4                      | ✓                                                    | As specified. |
| Radix headless primitives                 | ✓ Dialog, Select, Label, Slot                        | Used wherever keyboard/aria correctness matters. |
| Lucide icons                              | ✓                                                    | Emoji icons in the prototype are not replicated; every icon is Lucide. |
| `libs/ui` package                         | `@parambhariya/ui` (workspace:*)                     | Exports primitives, patterns, layout, theme, `styles.css`. |

## Tokens

- Copied **verbatim** from `screens/tokens.css` (the canonical contract per EXPORT.md).
- Mapped into Tailwind 4 `@theme` so utilities like `bg-brand-500`, `text-life-fruiting-fg`, `text-warn-fg` resolve.
- Spacing scale has deliberate gaps (no 5/7/9/10/11) — Tailwind picks up only the declared `--spacing-*` keys.
- Dark mode is `[data-theme="dark"]`; tenants are `[data-tenant="…"]`. Brand stays constant across light/dark.

## Iconography

Migrated to **Lucide** per the README's mapping (sprout, triangle-alert, check-circle-2, thermometer, droplets, wind, sun, map-pin, dna). Every icon is paired with a text label (`aria-label` on icon-only buttons; visible label otherwise). No emoji shipped.

## Critical alerts

The `Alert` primitive accepts `onDismiss` *only* for non-critical info banners. Critical sensor banners render without `onDismiss` and must be acknowledged via an explicit action — see `routes/alerts.tsx` and `routes/zone.$zoneId.tsx`.

## Mobile / Capacitor

- `capacitor.config.ts` is wired (`in.parambhariya.app`).
- `--safe-top` / `--safe-bottom` CSS env vars consumed by `TopBar` and `BottomNav` for notch + home-indicator clearance.
- iOS/Android native projects are **not** scaffolded by default — run `pnpm cap:add:ios` / `cap:add:android` once locally to materialize them; they don't belong in source control until the team chooses native config to commit.

## Known unfinished work

- **Components not yet built:** Tabs, Tooltip, Popover, DropdownMenu, Switch, Checkbox, Radio, Slider, Progress, Spinner, File input, Datepicker, Combobox, Avatar, Tag, Activity feed, Pipeline kanban (richer than the current `Flows` placeholder), Sparklines, Environment chart. These are in the prototype's `screens/library/` HTML demos. Add as needed when a real consumer screen demands them.
- **No tests, no Storybook.** Foundation only.
- **`apps/api` (tRPC) and `apps/edge` (sensor gateway)** referenced in the README are not scaffolded — mock data in `apps/web/src/data/mock.ts` stands in.
- **No real auth.** `/login` navigates straight to `/dashboard`. Wire to real auth before shipping.
- **`tools/` exists in the file tree but is empty** — reserved for codegen, scripts.

## Why a workspace at all (instead of one app)

The handoff explicitly targets a separately-publishable `libs/ui`. Keeping that boundary from day one means: (1) the dashboard can't reach into private UI internals, (2) you can publish `@parambhariya/ui` to a private registry later without restructuring, (3) when `apps/api` and `apps/edge` land, the workspace already has a home for them.
