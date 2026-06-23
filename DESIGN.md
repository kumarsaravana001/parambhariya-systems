# Design System — Parambhariya

> Source of truth for every visual and UI decision in this repo. Tokens are law. Read this before touching anything that renders.
> This file captures the **locked** Parambhariya Design System (Package 1 + 2). It is documentation of an existing system, not an invitation to redesign.

## Product Context
- **What this is:** A multi-tenant IoT platform for precision mushroom farming. Farm → room → zone → bag lifecycle monitoring with live sensor data (temperature, humidity, CO₂, light).
- **Bigger mission (from the 2026 deck):** Parambhariya grows mycelium packaging to replace plastic. "Grown, not manufactured. Built by Mushrooms, not machines." The farm platform is the production backbone behind that. "A century ago penicillin (fungus) healed humans; today mycelium (fungus) can heal the earth."
- **Who it's for:** Farm operators in the field. A grower wearing gloves in a humid grow room on a low-end Android over rural 2G/3G, in sunlight. Not a CTO at a desk.
- **Space:** AgTech / controlled-environment agriculture. India / Tamil Nadu context default (Anaimalai, Pollachi, Coimbatore).
- **Default tenant:** MushroomAI (green). Alternate: AquaFarm (blue). Brand color is runtime-mutable per tenant.
- **The one thing to remember:** calm, legible, serious farm software that never wastes a pixel on decoration.

## Aesthetic Direction
- **Direction:** Industrial / utilitarian, warmed by a chlorophyll-green identity. Function first, data dense, mono accents.
- **Decoration level:** minimal. Typography and borders do the work.
- **Mood:** Calm, plainspoken, agricultural. Legibility over polish. Every visual cycle goes to readability in sunlight and on cheap screens, not to ornament.
- **Backgrounds:** flat colored surfaces only. No gradients, no images, no textures, no patterns. Hero areas use a brand-50 wash at most.
- **Imagery brief (when ever needed):** warm, naturalistic, real farm scenes. No glossy product photography, no stock photos, no AI-generated imagery. Icon-forward, not photographic.

## Typography
- **Display / Hero:** Inter 700 — welcome hero (text-2xl), page H1 (text-xl).
- **Body / UI:** Inter 400/500/600.
- **Data / readings / IDs / codes:** JetBrains Mono 400/500 (`26.3 °C`, `#1847`, `A-4127`).
- **Loading:** Google Fonts — `Inter:wght@400;500;600;700` + `JetBrains+Mono:wght@400;500`.
- **Scale (px):** 2xl 30/700 · xl 24/700 · lg 18/600 · md 15/600 · base 14/400 · sm 13/400 · xs 11/600 (uppercase eyebrow).
- **Line-height:** tight 1.2 (hero, H1) · snug 1.35 (H2/H3) · base 1.5 (body).
- **Tracking:** tighter -0.015em (H1) · tight -0.01em (card titles) · eyebrow 0.06em (uppercase labels).
- **Never primary:** Inter and Space Grotesk are the convergence trap for AI tools; here Inter is the *specified* UI face (substituted from system-ui by design contract) — keep it, but do not reach for it as a "default."

## Color
- **Approach:** restrained. One brand axis + neutrals + a five-pair semantic set + the lifecycle palette.
- **Brand (green ramp, tenant-mutable; `#4baf3b` is the anchor and is BACKGROUND-ONLY):**
  - 50 `#eef7ec` · 100 `#d4ecce` · 300 `#8dcc7e` · **500 `#4baf3b`** · 600 `#3d9530` · 700 `#2f7724` · 900 `#1c4416`
  - **Rule:** when brand must be text, use **brand-700** `#2f7724` (500 fails contrast as text).
- **Surfaces:** bg `#f7f8f6` · card `#ffffff` · muted `#f1f3ef` · sunken `#ebedea` · overlay `rgba(15,23,18,0.5)`.
- **Text:** primary `#14201a` · secondary `#4a5950` · muted `#5e6a62` · inverse `#ffffff`.
- **Borders:** default `#e3e6e1` · strong `#cdd3cb` · focus `#4baf3b`.
- **Status (each a bg+fg pair, always used together):** success `#d8eed3`/`#2f7724` · warn `#fcf3cd`/`#7a5a00` · danger `#fbdcd6`/`#b32a1a` · info `#e2ecf8`/`#2461b8` · neutral `#ecedeb`/`#5c655e`.
- **Lifecycle palette — the domain signature (DO NOT redesign). Red = contamination only:**
  - CREATED `#eef0f3`/`#475569` (slate, dormant)
  - COLONIZING `#ccfbf1`/`#0f766e` (teal, microbial growth)
  - PINNING `#fef3c7`/`#a06a00` (gold, emerging — on-fill text `#1a0f00`)
  - FRUITING `#e8f5e3`/`#2f7724` (brand green, mature)
  - HARVESTED `#c8dfbc`/`#1c4416` (deep forest, stored)
  - CONTAMINATED `#fbdcd6`/`#b32a1a` (the only red)
  - Sequence: CREATED → COLONIZING → PINNING → FRUITING → HARVESTED. CONTAMINATED + DISPOSED are off-track terminal states.
- **Dark mode:** `data-theme="dark"`. Brand unchanged; surfaces invert; lifecycle/status get darker bg + lighter fg. (Dark values tuned by eye, not yet contrast-measured.)

## Spacing — 8px grid
`0 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80` px. Scale deliberately skips 5/7/9/11 — pick from the set. Cards 16 (md). Dialogs + login 24 (lg). Stacks gap 16 or 24.

## Layout
- **Mobile-first.** Two designed widths: 390 (mobile) and 1440 (desktop). Everything between reflows fluidly — no tablet-specific artwork.
- **TopBar:** sticky, 64px, z-nav (10), brand + logout.
- **Sidebar:** desktop-only (`md:flex`), 240px expanded / 72px collapsed.
- **BottomNav:** mobile-only (`md:hidden`), 4-tab.
- **Main:** `max-w-7xl mx-auto px-4 py-6`, `pb-24` on mobile to clear bottom nav.
- **Touch targets ≥ 44px** on coarse pointers.
- **Border radius:** sm 6 · md 10 (buttons, inputs, badges) · lg 14 (cards) · xl 18 (modals) · full 9999 (pills, lifecycle badges, avatars).
- **Shadows:** used sparingly. Borders separate, not elevation (reads in sunlight). xs/sm/md/lg defined; md only on hovered cards + dialog.

## Motion
- **Approach:** restrained. Three durations: fast 120ms · base 180ms · slow 300ms.
- **Easing:** default `cubic-bezier(.4,0,.2,1)` · enter `(0,0,.2,1)` · exit `(.4,0,1,1)`.
- **Dialog:** enter 200ms ease-out (fade + scale .95→1) · exit 150ms ease-in. Spinner `animate-spin`, skeleton `animate-pulse`.
- **No bounce, no spring, no parallax.** All motion collapses to 0.01ms under `prefers-reduced-motion`.

## Iconography
- **Lucide** (1.5–1.6px stroke, rounded caps, 24×24, currentColor). Names: `sprout` (farm) · `door-open` (room) · `layout-grid` (zone) · `package` (bag) · `thermometer` · `droplet`/`droplets` (humidity) · `wind` (CO₂) · `sun` (light) · `dna` (strain) · `bell` · `map-pin` · `triangle-alert` · `check` · `qr-code`.
- **Hand-drawn brand exceptions:** the leaf/mushroom mark (`src/icons/BrandMark.tsx`) and the 5 lifecycle biology glyphs (`src/icons/lifecycle.tsx`: sealed bag → mycelium threads → pinheads → mushroom → harvest basket).

## Core Rules
1. **Tokens are law.** Every color/size/radius/shadow/duration comes from the token set. No inline literals. Components use `bg-brand-*`, never hardcoded hex.
2. **Color is never alone.** Every status carries color + label (+ glyph for lifecycle). Color-blind and sunlight safe.
3. **Red means contamination.** Never red for warnings — that's `warn` gold.
4. **WCAG AA minimum** for text (≥4.5:1). Brand-500 is background-only; brand-700 for brand-as-text.
5. **Flat surfaces.** No gradients/textures. Borders separate, not shadows.
6. **Calm, plainspoken voice.** Talk to a grower in gloves. Domain terms stay (bags, colonizing, fruiting) — don't soften them.
7. **Critical alerts** (sensor out of range = lost crop) render as full-width banners in danger tone, persistent until acknowledged, never dismissible by tap-elsewhere.

## Voice & Content
- **Casing:** Title Case for nav/headings. Sentence case for body/dialogs. `UPPER_SNAKE` for status enums. Sentence-case verbs for buttons ("Create farm", "Sign in").
- **Numbers:** value + space + unit — `26.3 °C`, `925 ppm`, `92.5 %`. Temp/humidity 1 decimal, CO₂/light integers. Em-dash `—` = no reading.
- **Empty state:** "No farms yet" / "Create your first farm to start monitoring your mushroom production." / "+ Create Your First Farm".
- **Error:** "Sensor offline · Room A-2 — Last reading 14m ago. Crop loss possible." Direct, no apology padding.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-23 | DESIGN.md created capturing the locked system | The Parambhariya Design System was already fully specified (handoff bundle + reference .md). This file makes it the repo's source of truth without redesigning anything. |
| 2026-06-23 | Real leaf/mushroom brand mark replaces "P" placeholder | Spec names the leaf mark as a hand-drawn brand exception; the 2026 deck's mycelium/heal-the-earth identity supports a fungal mark. |
