# CBM Lab Portal — Captured Ideas

> Source: `CBM-Lab-Portal-Documentation.html` (Culture Bank Manager, cbm.agripie.com, Agripie Agrosystem LLP — June 2026).
> This is a **separate product** from the Parambhariya farm platform: a SaaS portal for tracking microbial cultures in a lab. Same founder, adjacent domain (mycology).
>
> **Where it lives in this repo:** a self-contained **Lab Portal** section at `/lab/*` in `apps/web`, built with the **locked Parambhariya design system** (green, our tokens). CBM's own blue/navy palette is captured in §Design below for reference only — we did **not** adopt it (one app, one visual system; tokens are law per `DESIGN.md`).

## 1. Overview
- **Product:** Culture Bank Manager (CBM) — microbial culture tracking SaaS.
- **Company:** Agripie Agrosystem LLP · GSTIN 10ABTFA6794R1ZI.
- **Users:** lab admins, technicians, viewers in microbiology/mycology labs.
- **Model:** subscription SaaS, 15-day free trial, Indian GST-inclusive pricing.

## 2. Navigation (the section's sub-nav)
Lab Profile/Dashboard · Cultures · Storage Locations · Categories · Data & Backup · Users · Custom Fields · Subscription · Audit Logs · Security · User Manual · Support. Top banner for trial/verify notices.

## 3. Lab Dashboard (`/lab`)
Hero banner with 4 stat cards (Total Cultures, Active Members, Storage Locations, Categories). Two-column grid: **left** Culture Health (active/inactive/contaminated counts), Recent Activity feed (empty: "No activity yet — add your first culture to get started"). **right** Plan Usage (storage GB, cultures, team seats progress bars), Lab Info, Quick Actions, Team Members, Lab Management danger zone (Put on Hold / Suspend / Delete Lab — password required).

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

## 8. Users
Table: Name (you) · Email · Role · Status · Joined · Edit. Add-user modal with two modes (Send invitation / Set password), fields Full name, Email, Role. **Roles:** Admin (full), Technician (edit cultures), Viewer (read-only).

## 9. Custom Fields
Define extra fields shown on every culture (Basic tab + import template + exports). Inline add form: Label, Field Type (Text/Number/Date/Dropdown/Long Text), Required checkbox. Deleting a field keeps existing values.

## 10. Subscription & Billing
Current plan card (trial countdown), storage usage bar, billing info form (Legal name, Billing email, Country, Address, City, State, PIN, GSTIN, PAN). GST-inclusive (18%, HSN 997331).
**Plans (₹/mo, monthly/annual):** Micro ₹419 (25 cultures / 1 user / 250 MB) · **Inoculum ₹1,249** (100 / 1 / 1 GB, popular) · Primordia ₹3,329 (500 / 2 / 2 GB, +custom fields, +bulk import) · Stroma ₹7,999 (2,000 / 10 / 5 GB, +dedicated support) · Enterprise (custom). Billing history table.

## 11. Audit Logs
Filter bar: search, Tables (Cultures/Isolation/Revival/Transfers/Storage), Actions (Created/Updated/Deleted), Entries, date range, count, refresh. Table of who-did-what-when across tracked tables.

## 12. Security (2FA)
Two-Factor Authentication: Authenticator app (TOTP) + Email OTP cards, each with enable/setup. Change password section.

## 13. Help / Support
Searchable manual, category grid (Getting Started, Cultures, Storage, Passages, QR Labels, Users, Security, Data, Audit, Subscription, Invoices, International), accordion FAQs, Contact Support CTA.

---

## Design (CBM native palette — reference only, NOT used here)
CBM's own system, kept so a separately-branded build is possible later:
- Primary Blue `#3b82f6`/`#2563eb` · Dark navy sidebar `#1a1a2e`/`#0f172a` · secondary `#1e3a5f` · success `#16a34a` · warn `#f59e0b` · danger `#dc2626` · muted `#64748b` · admin purple `#7c3aed`.
- Type: Inter/system, H1 24/600-700, H2 18/600, body 14/400, table header 12/600 caps.

**Our mapping** (what the `/lab` section actually renders with):
| CBM concept | Parambhariya token |
|---|---|
| primary blue CTA | `bg-brand-500` (green) |
| culture active | `success` |
| inactive / archived | `neutral` |
| quarantine | `warn` |
| extinct / contaminated | `danger` / lifecycle `contam` |
| admin role badge | `info` (we don't add a purple token) |
| dark navy sidebar/hero | `surface-sunken` / brand-50 wash |

Lab screens reuse `@parambhariya/ui`: `Table`, `Tabs`, `Dialog`, `Combobox`, `DatePicker`, `FileInput`, `Tag`, `Badge`, `Switch`, `Checkbox`, `Radio`, `MetricCard`, `EmptyState`, `AlertBanner`, `Avatar`, `Progress`, `SearchInput`, `DataList`.
