# Parambhariya Lab Portal — Captured Ideas

> Source ideas distilled from a culture-tracking reference doc (June 2026).
> **Internal/private only.** This is the Parambhariya team's own lab tool — it is **not a product we sell** and has **no commercial layer**: no free trial, no subscription/billing, no plan limits, no team-invitation/seat management. Those concepts from the source SaaS were intentionally dropped.
>
> **Where it lives in this repo:** a self-contained **Lab Portal** section at `/lab/*` in `apps/web`, built with the **locked Parambhariya design system** (green, our tokens). The source product's blue/navy palette is captured in §Design below for reference only — we did **not** adopt it (one app, one visual system; tokens are law per `DESIGN.md`).

## 1. Overview
- **Tool:** Parambhariya Lab Portal — internal microbial culture tracking.
- **Owner:** Parambhariya (Coimbatore, Tamil Nadu).
- **Users:** the Parambhariya lab team (internal). No external sign-up, no roles-as-a-service.
- **Scope:** internal record-keeping only. No SaaS / billing / trial.

## 2. Navigation (the section's sub-nav)
Dashboard · Cultures · Storage Locations · Categories · Data & Backup · Custom Fields · Audit Logs · Security.
*(Dropped as non-internal: Users/team management, Subscription/billing, trial banner, User Manual/Support marketing.)*

## 3. Lab Dashboard (`/lab`)
Hero banner with 4 stat cards (Total Cultures, Active Cultures, Storage Locations, Categories). Two-column grid: **left** Culture Health (active/inactive/contaminated counts), Recent Activity feed (empty: "No activity yet — add your first culture to get started"). **right** Quick Actions, Lab Info. *(Plan Usage and Team Members were removed — internal tool, no plans or team seats.)*

## 4. Cultures (main CRUD)
- **List:** search, Import, "+ Add Culture". 4 summary stat cards (Total / Active / Contaminated / With Storage). Filter bar (Status, Category, Contamination, Location dropdowns + "Overdue only" toggle). Data table: checkbox · Culture ID (CB-001) · Organism (genus + species) · Kingdom · Status · Gen · Stock · Storage · Next Transfer.
- **Add Culture modal — 8 tabs:** Basic (Identity + Transfer Schedule + Notes), Isolation, Revival, Transfers (passage log), Observations, Inventory, Storage, Logs.
  - Identity fields: Culture ID (auto CB-001), Status, Culture Format, Common/Strain Name, Strain Code, Acquisition Date, Genus, Species, Kingdom, Category (cascading), Source.
  - Transfer Schedule: Subculture Interval (days, default 15), Next Transfer Date (auto), Enable reminders (default on), Notify X days before (default 3).
- **Statuses:** active (green) · inactive (gray) · archived (gray) · quarantine (orange) · extinct (red). Plus a contamination flag.
- **Import:** `.xlsx` / `.json`.

## 5. Storage Locations
Hierarchical tree: Building → Room → Freezer → Rack → Box → Position. New-location modal: Name, Type, Temperature range, Description. Types: building, room, incubator, refrigerator (4°C), freezer (−20°C), ultra-low freezer (−80°C), rack, box, shelf, position.

## 6. Categories
Hierarchical tree (e.g. Fungi → Basidiomycetes → Gilled Mushrooms). New-category modal: Category name.

## 7. Data & Backup
Three export cards: Excel Workbook (5 sheets), Culture Report (PDF), Full Backup (JSON). Import dropzone (`.xlsx`/`.json`). Excel format guide: required columns Culture ID*, Name*, Genus*, Species*, Status*; optional Kingdom, Common Name, Strain Code, Contaminated, Notes. Existing IDs skipped (no overwrite).

## 8. Users / team management — **dropped (internal tool)**
The source SaaS had a Users screen (invite, roles, seats). Removed: this is an internal single-team tool, not a service. Audit logs still attribute actions to a person's name, which is enough for accountability.

## 9. Custom Fields
Define extra fields shown on every culture (Basic tab + import template + exports). Inline add form: Label, Field Type (Text/Number/Date/Dropdown/Long Text), Required checkbox. Deleting a field keeps existing values.

## 10. Subscription & Billing — **dropped (not a product we sell)**
No plans, pricing, trial, GST/billing forms, or invoices. Storage/limits are not metered for internal use.

## 11. Audit Logs
Filter bar: search, Tables (Cultures/Isolation/Revival/Transfers/Storage), Actions (Created/Updated/Deleted), Entries, date range, count, refresh. Table of who-did-what-when across tracked tables.

## 12. Security (2FA)
Two-Factor Authentication: Authenticator app (TOTP) + Email OTP cards, each with enable/setup. Change password section.

---

## Design (source palette — reference only, NOT used here)
The reference doc's own palette, kept only for context:
- Primary Blue `#3b82f6`/`#2563eb` · Dark navy `#1a1a2e`/`#0f172a` · success `#16a34a` · warn `#f59e0b` · danger `#dc2626` · muted `#64748b`.
- Type: Inter/system, H1 24/600-700, H2 18/600, body 14/400, table header 12/600 caps.

**Our mapping** (what the `/lab` section actually renders with — Parambhariya tokens):
| Source concept | Parambhariya token |
|---|---|
| primary blue CTA | `bg-brand-500` (green) |
| culture active | `success` |
| inactive / archived | `neutral` |
| quarantine | `warn` |
| extinct / contaminated | `danger` / lifecycle `contam` |
| dark navy sidebar/hero | `brand-900` hero wash |

Lab screens reuse `@parambhariya/ui`: `Table`, `Tabs`, `Dialog`, `Combobox`, `DatePicker`, `FileInput`, `Tag`, `Badge`, `Switch`, `Checkbox`, `Radio`, `MetricCard`, `EmptyState`, `AlertBanner`, `Avatar`, `Progress`, `SearchInput`, `DataList`.
