# Handoff: Thomson Print Portal Redesign

## Overview

This package contains a full visual redesign of the Thomson Print Portal — an internal workflow tool for a commercial print shop. It replaces the existing Next.js/Tailwind/DaisyUI interface with a cohesive "Press Room" design system: warm paper neutrals, editorial serif display type, monospace metadata, and a single deep press-green accent. Screens covered: login, dashboard, orders list, order detail, work orders list, and a create-work-order flow. All other sections in the app (Companies, Paper, Typesetting, Shipping, Reports, Settings) follow the same established patterns.

## About the Design Files

The files in `design_files/` are **HTML/CSS/React design references** — working prototypes that demonstrate the intended look, layout, component behavior, and interaction patterns. **They are not production code to copy directly.**

The target codebase is a Next.js 14 (App Router) project using:
- React 18, TypeScript
- Tailwind CSS (with DaisyUI currently — can be removed or kept isolated)
- tRPC + Prisma
- `~/app/_components/...` co-located component folders

Your job is to **recreate these designs inside the existing codebase** using its patterns (server components where appropriate, tRPC data fetching, Prisma types). Port the visual system (tokens, typography, component styles) into Tailwind config + a small CSS layer, and rebuild each screen as real React components wired to the existing tRPC routers (`api.orders`, `api.orderItems`, `api.workOrders`, etc.).

## Fidelity

**High-fidelity.** Exact colors, typography scale, spacing, border treatments, and component states are specified and should be matched closely. Data shown in the prototypes is placeholder; wire the real tRPC queries in.

## Design System

### Typography
- **Display**: Fraunces (variable, opsz 9..144) — weights 400 & 500, used italic for accents. Page titles, stat values, section headers.
- **UI**: Inter — 400/500/600. All body, buttons, form controls, table cells.
- **Mono**: JetBrains Mono — 400/500. Labels, metadata, numeric data, breadcrumbs, `.uppercase-label`, codes.

Load via Google Fonts:
```
family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500
family=Inter:wght@400;500;600
family=JetBrains+Mono:wght@400;500
```

Font features: `font-feature-settings: "ss01", "cv11"` on body; `"zero"` on `.mono`.

### Color Tokens (all oklch)
Paper neutrals (warm, low-chroma, hue ~85):
- `--paper`    `oklch(98.4% 0.006 85)` — page background
- `--paper-2`  `oklch(96.8% 0.008 85)` — subtle surface
- `--paper-3`  `oklch(93.4% 0.010 85)`
- `--paper-4`  `oklch(89.0% 0.012 85)`
- `--rule`     `oklch(88.0% 0.010 85)` — hairline borders
- `--rule-2`   `oklch(82.0% 0.012 85)` — stronger borders

Ink neutrals (hue 65):
- `--ink`      `oklch(18.0% 0.015 65)` — primary text
- `--ink-2`    `oklch(32.0% 0.012 65)`
- `--ink-3`    `oklch(48.0% 0.010 65)` — secondary text
- `--ink-4`    `oklch(62.0% 0.010 65)` — tertiary

Brand accent:
- `--press`    `oklch(42.0% 0.10 155)` — deep press green, replaces legacy `#005c2f`
- `--press-2`  `oklch(36.0% 0.11 155)`

CMYK process colors (data viz decoration only):
- `--cyan`     `oklch(68.0% 0.14 220)`
- `--magenta`  `oklch(62.0% 0.22 0)`
- `--yellow`   `oklch(88.0% 0.17 95)`
- `--key`      `oklch(22.0% 0.010 65)`

Semantic:
- `--ok`       `oklch(54.0% 0.12 155)`
- `--warn`     `oklch(70.0% 0.15 70)`
- `--danger`   `oklch(55.0% 0.19 25)`
- `--info`     `oklch(55.0% 0.12 240)`

### Radii & Shadows
- `--r-xs: 2px; --r-sm: 4px; --r-md: 6px; --r-lg: 10px` — deliberately tight, no large pills.
- Shadow-1: `0 1px 0 rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.04)`
- Shadow-2: `0 2px 0 rgba(0,0,0,.03), 0 4px 12px rgba(0,0,0,.06)`

### Spacing
Base grid of 4px. Page padding 28px, card padding 16–20px, form gaps 14–18px.

## Screens

### 1. Login (`/`)
Split layout, 1.15fr / 1fr.
- **Left (hero)**: `--ink` background, 40×56px padding, subtle 72px grid overlay at 4% opacity. Brand lockup top, large italic Fraunces tagline (~48px), small metadata block bottom with registration mark cluster.
- **Right (form)**: `--paper` background, centered, 380px max-width form. Title "Sign in" in Fraunces 28px. Email + password inputs (34px tall, 4px radius, 1px `--rule-2` border). Primary submit = full-width `--ink` button that goes `--press` on hover. "Forgot password" link bottom in `--press`.
- Preserves existing auth flow (NextAuth credentials provider already in codebase).

### 2. Dashboard (`/dashboard`)
Page head with Fraunces 34px title ("Dashboard"), mono breadcrumb-style subtitle, primary CTA on right.

- **Stat grid** (4 columns, 14px gap): each `.stat` card shows mono uppercase label, optional tiny CMYK swatch row, and large Fraunces 34px tabular value with mono delta underneath. Metrics: Active Orders, On Press Today, Due This Week, Monthly Revenue.
- **Tabs**: "Orders" / "Order Items" — mono subcount next to label. Underlines with `--press` on active.
- **Kanban** (5 columns): Pending → Typesetting → On Press → Bindery → Shipping. Columns are `--paper-2` with 1px `--rule`. Cards (`.k-card`) have order #, company, due date, status pill, and drag handle. Draggable (replace current `draggableWorkOrdersDash` logic). Hover adds shadow-1 + 1px translate.
- **Upcoming list** in right-hand split column: compact rows with date, order#, company, in-hands date (mono tabnum).

Wire to existing `api.orders.dashboard()` and `api.orderItems.dashboard()`.

### 3. Orders list (`/orders`)
Full-width page. Filter bar: search (`.search-box` 280px), status segmented control, date-range button, "New order" primary button.

Table (`.tbl`): mono uppercase column headers on `--paper-2`, 12.5px body text, 12/14px padding. Columns: Order #, Company, PO #, In-Hands, Status, Deposit, Total, Actions (dots-v). Numeric columns mono + tabular-nums. Row hover `--paper-2`. Sticky header.

Pagination footer: mono "SHOWING 1–25 / 342" + prev/next 26px buttons.

### 4. Order detail (`/order/[id]`)
Back link top (`← Orders` in mono). Page head shows Fraunces title "Order [em]#24081[/em]" (italic `--press` accent on number), status pill and action buttons right.

Split layout, 2.2fr / 1fr:
- **Left**: Line items card (table of items with description, qty, unit price, total). Activity timeline card below (vertical rule with dotted markers, time in mono, who/what in UI sans).
- **Right sidebar**: meta cards — Customer, Shipping, Totals, Documents. Each uses `.uppercase-label` heads and mono data. Totals card has bordered subtotal rows with a final bold total.

### 5. Work orders (`/work-orders`)
Production-floor view. Filter bar similar to Orders but with Press selector.

Cards (not table): each WO shown as a `.card` with:
- Header: WO number (mono large), company, due date
- Progress rail (`.progress-rail`) showing 5 segments colored by stage completion
- Stage chips below — Typesetting / Proof / Press / Bindery / Ship — current stage highlighted with `--press`
- Quantity, paper stock, press assignment in 3-col mono meta strip

### 6. Create WO (`/work-orders/new`)
Multi-step form, three numbered sections visible at once on wide screens:

1. **Order details** — company search-select, PO #, in-hands date, contact.
2. **Paper & press** — paper picker (grid of cards showing stock name, weight, finish, color swatch), press dropdown, quantity input.
3. **Production** — line items repeater (description + qty + notes), special instructions textarea, file upload zone.

Sticky footer: "Save draft" ghost + "Create work order" primary.

## Components to Build

Core primitives (see `design_files/components/primitives.jsx`):
- `Icon` set — 30+ SVG line icons at 20×20 viewBox, 1.5 stroke. Can keep these inline SVG or swap to `lucide-react` (visually close). **All SVGs need explicit `width`/`height` or a global `svg { width: 14px; height: 14px }` fallback.**
- `RegMark` — 14×14 registration-mark decoration.
- `CmykRow` — 4 tiny 6×6 squares in CMYK.
- `Pill` — status chip, 10px mono uppercase, color-mixed background. Status map: pending/approved/typesetting/proof/press/bindery/shipped/invoiced/cancelled.
- `Meta` — label + value stack; supports mono mode.

Shell:
- `Sidebar` — 240px, `oklch(20% 0.012 65)` background, groups labeled in mono. Active item: `--press` left bar + slightly lighter background. User chip pinned bottom.
- `Topbar` — 56px sticky, backdrop blur, breadcrumbs (mono uppercase) left, 280px search-box center-right, icon buttons + notification dot + avatar right.

## Interactions & States

- **Hover**: most interactives shift bg by one step (`--paper-2` / `--paper-3`) and strengthen border to `--ink-4`. Kanban cards lift 1px and gain shadow-1.
- **Active/selected**: nav items get `--press` left bar; buttons shift to `--ink` bg; segmented control highlights selected; tabs underline in `--press`.
- **Focus**: `.input:focus` → `--ink` border + `0 0 0 3px rgba(0,0,0,.06)` ring.
- **Disabled**: 50% opacity, no hover.
- **Loading**: use a simple mono `.uppercase-label` spinner text + a 1px progress bar in `--press`.
- **Empty**: center a `RegMark`, then mono `.uppercase-label` + `--ink-3` helper line.

## Responsive

- ≥1200px: full 2-col shell, 4-up stat grid, 5-col kanban, 2.2/1 split.
- 900–1200px: stat grid 2×2, kanban 3-col with scroll, split stacks.
- <900px: sidebar collapses to icon rail (48px), auth becomes single column.

## Assets

- Fonts: Google Fonts (no self-hosting needed; the existing `public/fonts/` can be removed).
- Icons: inline SVGs in `primitives.jsx`, or swap to `lucide-react` for equivalents (dashboard→`LayoutGrid`, orders→`FileText`, etc.).
- Logo: existing Thomson wordmark should be refit into the new 28×28 mark box in the sidebar; preserve the wordmark on login only.
- No photography required in the prototype; if product imagery is added later, keep it duotone with `--ink` and `--paper`.

## Screenshots

See `screenshots/` for reference images of each screen:
- `01-login.png` — Login / landing
- `02-dashboard.png` — Dashboard with stats + kanban
- `03-orders.png` — Orders list table
- `04-order-detail.png` — Order detail split view
- `05-work-orders.png` — Work orders production view
- `06-create-wo.png` — Create work order form

## Files in This Bundle

```
design_handoff_print_portal/
  README.md                                    ← this file
  screenshots/                                 ← reference PNGs of each screen
  design_files/
    Thomson Print Portal Redesign.html         ← root prototype, React + Babel
    styles/
      tokens.css                               ← color/type/spacing tokens + base components
      shell.css                                ← layout, sidebar, topbar, tabs, kanban, auth
    components/
      data.jsx                                 ← mock data for prototype (replace with tRPC)
      primitives.jsx                           ← icons, pills, meta, RegMark
      shell.jsx                                ← Sidebar + Topbar
      page-dashboard.jsx                       ← Dashboard screen
      pages.jsx                                ← Login, Orders, OrderDetail, WorkOrders, CreateWO
```

## Implementation Order (suggested)

1. Port tokens to `tailwind.config.ts` (colors, fontFamily, borderRadius) + a small `globals.css` for oklch vars.
2. Set up font loading via `next/font` (Fraunces, Inter, JetBrains Mono).
3. Build the shell (`layout.tsx` + Sidebar + Topbar components), replace the current `NavBar`.
4. Build `Pill`, `Meta`, `RegMark`, and the `Icons` set (or swap lucide).
5. Rebuild Dashboard wired to existing tRPC queries — reuse current server component pattern from `app/dashboard/page.tsx`.
6. Rebuild Orders list, then Order detail, then Work orders, then Create WO.
7. Update Login screen last (NextAuth integration is already working; only visuals change).
