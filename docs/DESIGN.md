# Press Room Design System

Thomson Print Portal uses a custom design system called **Press Room** — a print-industry aesthetic built on OKLCH color tokens, editorial typography, and semantic CSS component classes. No Tailwind utility classes in new components; no DaisyUI in new components.

---

## Typography

All fonts loaded via `next/font/google` in `src/app/layout.tsx`. CSS variables are set on `<html>` and referenced in `@theme`.

| Role | Font | CSS Variable | Usage |
|---|---|---|---|
| Body / UI | Inter | `--font-sans` | All interface text, labels, inputs |
| Display | Fraunces (optical sizing) | `--font-display` | Page titles (`h1.page-title`), hero headings, auth screens |
| Mono | JetBrains Mono | `--font-mono` | Order numbers, amounts, codes, breadcrumb labels |

**Conventions**

- Page titles use Fraunces with a split italic: `Or<em>der</em>` — the italic portion renders in `--press` green
- Uppercase labels use `.uppercase-label`: 10px, JetBrains Mono, 0.1em letter-spacing
- Tabular numbers: add `.tabnum` class for currency/quantity columns in tables
- Mono values: add `.mono` class — sets JetBrains Mono + zero-slashed zero feature

---

## Color Tokens

All tokens defined in `src/styles/globals.css` under `:root` using OKLCH. Reference them with `var(--token)`.

### Surface & Ink

| Token | Value | Usage |
|---|---|---|
| `--paper` | `oklch(98.4% 0.006 85)` | Page background, card backgrounds |
| `--paper-2` | `oklch(96.8% 0.008 85)` | Hover states, subtle backgrounds |
| `--paper-3` | `oklch(93.4% 0.010 85)` | Borders, table rows |
| `--paper-4` | `oklch(89.0% 0.012 85)` | Strong backgrounds |
| `--rule` | `oklch(88.0% 0.010 85)` | Dividers, table borders |
| `--ink` | `oklch(18.0% 0.015 65)` | Primary text, primary buttons |
| `--ink-2` | `oklch(32.0% 0.012 65)` | Secondary headings |
| `--ink-3` | `oklch(48.0% 0.010 65)` | Muted text, labels, placeholders |
| `--ink-4` | `oklch(62.0% 0.010 65)` | Disabled text, separators |

### Brand

| Token | Value | Usage |
|---|---|---|
| `--press` | `oklch(42.0% 0.10 155)` | Primary brand green — CTA hover, active nav, italic accents |
| `--press-2` | `oklch(36.0% 0.11 155)` | Darker press for pressed states |
| `--press-on` | `oklch(98.0% 0.005 85)` | Text on press-colored backgrounds |

### CMYK Accents

Used decoratively (stat rails, `CmykRow` component, print metaphors).

| Token | Color |
|---|---|
| `--cyan` | `oklch(68.0% 0.14 220)` |
| `--magenta` | `oklch(62.0% 0.22 0)` |
| `--yellow` | `oklch(88.0% 0.17 95)` |
| `--key` | `oklch(22.0% 0.010 65)` |

### Semantic Tones

Used by the `Pill` component and status indicators.

| Token | Tone name | Usage |
|---|---|---|
| `--ok` | `ok` | Completed, Paid, Shipped |
| `--warn` | `warn` | On Hold, Pending, Overdue |
| `--danger` | `danger` | Cancelled, Error |
| `--info` | `info` | Prepress, Outsourced, Sent |
| _(none)_ | `""` | Pending/Draft (neutral) |

---

## Layout

### Shell

```
<div class="app">
  <Sidebar />           ← .sidebar (fixed, 220px)
  <div class="main">
    <Topbar />          ← .topbar (sticky, 48px)
    <div class="content">
      {page content}    ← padding: 28px
    </div>
  </div>
</div>
```

### Page Head

Every authenticated page starts with a `.page-head`:

```tsx
<div className="page-head">
  <div>
    <div className="page-sub">
      <RegMark />
      &nbsp;
      <span>Section · Context</span>
    </div>
    <h1 className="page-title">
      Page<em>Title</em>      {/* italic suffix renders in --press */}
    </h1>
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <Link href="..." className="btn primary">+ Action</Link>
  </div>
</div>
```

When a status pill appears beside the title, wrap text in `<span>` to prevent flex-gap splitting the word:

```tsx
<h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span>Or<em>der</em></span>
  <Pill status={order.status} />
</h1>
```

### Split Layout

Detail pages use `.split` for a main column + sidebar:

```tsx
<div className="split">
  <div style={{ flex: 2, minWidth: 0 }}>  {/* main content */}</div>
  <div style={{ flex: 1, minWidth: 220 }}> {/* sidebar meta */}</div>
</div>
```

### Auth Layout

Login, homepage, and public-facing pages use `.auth-root`:

```tsx
<div className="auth-root">       {/* grid: 1.15fr 1fr */}
  <div className="auth-hero">     {/* dark left column */}</div>
  <div className="auth-form-col"> {/* centered right column */}
    <div className="auth-form">   {/* max-width: 380px */}</div>
  </div>
</div>
```

---

## Components

### Buttons

```tsx
<button className="btn">Default</button>
<button className="btn primary">Primary</button>
<button className="btn ghost">Ghost</button>
<button className="btn sm">Small</button>
<button className="btn lg">Large</button>
```

Primary button: `--ink` background, turns `--press` on hover. Never use DaisyUI `btn-primary` or shadcn `<Button>` in new components.

### Cards

```tsx
<div className="card">         {/* border, radius, padding 16px */}
  <div className="card-pad">   {/* extra inner padding when needed */}
```

### Tables

```tsx
<table className="tbl">
  <thead><tr><th>Col</th></tr></thead>
  <tbody><tr><td>Value</td></tr></tbody>
</table>
```

Add `.mono.tabnum` to currency/number cells for aligned tabular figures.

### Tabs

```tsx
<div className="tabs">
  <button className={`tab ${active ? "active" : ""}`}>Label</button>
</div>
```

### Stat Grid

```tsx
<div className="stat-grid">
  <div className="stat">
    <div className="stat-label"><span className="uppercase-label">Label</span></div>
    <div className="stat-value">42</div>
    <div className="stat-delta">Supporting text</div>
  </div>
</div>
```

### Inputs

```tsx
<input className="input" type="text" />
```

---

## Primitives

Located in `src/app/_components/primitives/`.

| Component | Usage |
|---|---|
| `<Pill status="Press" />` | Status badge — looks up `STATUS_MAP` for label + tone |
| `<Pill label="Custom" tone="warn" dot />` | Manual label/tone; `dot` adds a colored dot |
| `<RegMark />` | 14×14 crosshair registration mark SVG for `page-sub` |
| `<CmykRow />` | 4 × 6×6px CMYK color squares — decorative |
| `<Meta label="Label">value</Meta>` | Label + value stack; `mono` prop for tabular values |

### Pill STATUS_MAP

| Status key | Label | Tone |
|---|---|---|
| `Pending` | Pending | _(neutral)_ |
| `Prepress` | Prepress | info |
| `Press` | On Press | press |
| `Bindery` | Bindery | press |
| `Shipping` | Shipping | ok |
| `Invoiced` | Invoiced | ok |
| `Completed` | Completed | ok |
| `Cancelled` | Cancelled | danger |
| `Hold` | On Hold | warn |
| `Outsourced` | Outsourced | info |
| `PaymentReceived` | Paid | ok |
| `Draft` | Draft | _(neutral)_ |
| `Sent` | Sent | info |
| `Paid` | Paid | ok |
| `Overdue` | Overdue | danger |

---

## Breadcrumbs (Topbar)

The `Topbar` component builds breadcrumbs from the current pathname. Links are distinct at each level:

```
THOMSON (→ /)  /  Workspace (→ /dashboard)  /  Work Orders (→ /workOrders)  /  Detail
```

- **THOMSON** — always links to `/` (homepage)
- **Group label** (Workspace, Finance, Resources, Admin) — always links to `/dashboard`
- **Section name** (Orders, Work Orders, etc.) — links to its section root
- **Current page** — plain text, no link

To add a new section, add an entry to `SECTION_MAP` in `src/app/_components/shell/Topbar.tsx`. To add a human-readable label for a URL slug (e.g. `workOrderItem` → `"Item"`), add it to `SLUG_LABELS`.

---

## Rules for New Components

1. **No DaisyUI classes** (`btn-primary`, `card bg-base-100`, `navbar`, `steps`, etc.)
2. **No Tailwind utility classes** (`text-3xl`, `font-bold`, `px-4`, `container mx-auto`, etc.)
3. Use CSS tokens (`var(--ink)`, `var(--paper)`, etc.) for all colors
4. Use CSS component classes (`.btn`, `.card`, `.tbl`, `.pill`, etc.) for structure
5. Use inline `style={{}}` for one-off layout/spacing values
6. shadcn/ui components (`<Button>`, `<Input>`, etc.) are **legacy only** — do not use in new components
7. All new `page.tsx` files must start with a `.page-head` block
