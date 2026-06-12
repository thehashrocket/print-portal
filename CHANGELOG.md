# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See [VERSION](./VERSION) for the current version.

## [0.2.6.0] - 2026-06-11

### Fixed

- Dashboard filter popovers (Company Name, Order Number, Order Item Number) now render correctly as Press Room cards — previously they rendered as white shadcn boxes due to cascade layer conflicts between DaisyUI and the project's design system.
- Press Room primary action buttons (Sign In, page-head CTAs) now reliably show the brand green background — DaisyUI's layered `.btn` styles were previously overriding them.
- Kanban status badges and checkboxes on the dashboard now use brand green instead of DaisyUI's default purple/indigo — the `--primary` token was mis-pointed at an old lime value.
- Secondary action buttons are now visible at the correct warm-gray contrast level — the previous `--secondary` token resolved to near-white, making Cancel/Reset buttons nearly invisible on the paper background.
- Invoices page shows a helpful empty state when no invoices exist, with a link to create invoices from orders — previously showed a blank `div`.
- Lime green eye button on the Users grid and PWA install banner background no longer use the off-palette lime `#6cab1f` — replaced with neutral and semantic tokens.

### Added

- Dashboard tab component tests covering all three order-status cascade scenarios (Completed, Cancelled, Invoiced), cross-order isolation, and stat counter sync.
- Pill component tests covering the Approved, Proofing, and tone-override paths.
- Invoices table tests covering the empty state render: icon, heading, explanation copy, and View Orders link.

## [0.2.5.6] - 2026-06-04

### Fixed

- Dashboard Order Items tab now reflects status changes immediately when an order is completed, cancelled, or invoiced from the Orders tab — no page refresh needed. Previously, dragging an order to Completed updated the order in the database (and cascaded to its items) but the Order Items board still showed the old statuses until the page was reloaded.

## [0.2.5.5] - 2026-06-02

### Changed

- Work order and work order item status badges now use the same `Pill` component as the rest of the app — consistent styling across all entity types. Pending work orders retain their yellow warning color so items needing action remain visually distinct.
- Payment total calculations in the order router consolidated into a single shared helper — eliminates duplicated Decimal reduce logic that appeared in 5 separate procedures.

## [0.2.5.4] - 2026-05-27

### Fixed

- Order status updates now work correctly — `OrderVersion` and `OrderItemVersion` tables were missing from the database because the Prisma migration was never generated after the schema models were added. The migration creates both tables with proper indexes and foreign keys.

## [0.2.5.3] - 2026-05-27

### Fixed
- Added remaining JSDoc `@type {string}` casts to `scripts/check-docs.js` capture-group variables (`href` on line 130) so all TypeScript strict-mode errors in the file are eliminated and production builds succeed

## [0.2.5.2] - 2026-05-27

### Fixed
- Added JSDoc type annotations to `scripts/check-docs.js` so TypeScript strict-mode type-checking no longer fails with implicit `any` errors, unblocking production builds

## [0.2.5.1] - 2026-05-27

### Added
- `scripts/check-docs.js` — CI/CD documentation validation script that verifies Prisma model/enum counts and tRPC router count in `docs/ARCHITECTURE.md` match source files, and checks all relative markdown links in `docs/` resolve to existing files
- `pnpm check:docs` script wired to the new validator
- `Check docs` step added to `.github/workflows/ci.yml` — runs on every push and PR

### Fixed
- `docs/ARCHITECTURE.md` had three stale count claims: `38 models` (directory tree), `40 Prisma models` (prose), and `tRPC Routers (32)` (heading) — all corrected to reflect actual counts (39 models, 33 routers)
- `orderVersions` router missing from tRPC routers table in `docs/ARCHITECTURE.md` — added

## [0.2.5.0] - 2026-05-27

### Added
- **Component test suites** for WorkOrderForm (9 tests) and InvoiceForm (8 tests) using jsdom + @testing-library/react — covers render, validation errors, walk-in customer toggle behavior, mutation chains, form pre-population from order items, and router redirect on success
- `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, and `jsdom` added as dev dependencies to support browser-environment component testing

### Fixed
- Vitest setup file now uses the Vitest-specific `@testing-library/jest-dom/vitest` import, ensuring jest-dom matchers are correctly registered against Vitest's `expect` regardless of global configuration

## [0.2.4.0] - 2026-05-26

### Added
- **Change History timeline** on Order Detail page — CSRs can expand a collapsible panel to see a merged, chronological audit trail of every field change and status transition on an order and its line items
- `orderVersionsRouter` (`getByOrderId`) — tRPC endpoint that returns `OrderVersion` records with the changing user's name, used to power the timeline UI
- Non-status field change tracking for 5 order mutations (`updateDeposit`, `updateContactPerson`, `updateNotes`, `updateFields`, `updateShippingInfo`) and 4 order-item mutations (`updateDescription`, `updateSpecialInstructions`, `updateFields`, `updateShippingInfo`) — each now writes an `OrderVersion`/`OrderItemVersion` record with a before/after `changedFields` diff when the value actually changes

### Fixed
- Version write in `order.updateShippingInfo` no longer wraps `createOrderVersion` inside the try/catch that guards the DB update — a failing version write can no longer surface as a false shipping-update error to the client
- No-op saves (user saves without changing a value) no longer write empty version rows: `createOrderVersion`/`createOrderItemVersion` are now guarded by `if (changedFields)` so audit rows are only created when a value actually changed
- `OrderAuditTimeline` now shows a "Loading…" indicator while version data is fetching instead of prematurely showing "No change history recorded yet."
- Fixed invalid HTML: `<h2>` inside `<button>` replaced with `<span>`; added `aria-expanded` to the toggle button for screen-reader accessibility
- Field diff values of `null`/`undefined` now render as `—` instead of the literal strings `"null"`/`"undefined"`

## [0.2.3.0] - 2026-05-26

### Added
- QuickBooks router test suite: 30 tests across `qbCustomer`, `qbInvoice`, and `qbSyncCustomer` routers covering UNAUTHORIZED, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR error paths and happy-path mutations
- Invoice router: 3 additional tests for `InvoiceItems` mapping — unit price calculation from `amount/quantity`, division-by-zero guard when `quantity=0`, and empty `OrderItems` producing an empty `create` array

### Fixed
- Removed debug `console.log` statements from QB auth, customer, invoice, and sync-customer routers that were leaking OAuth access tokens, OAuth state parameters, and QuickBooks client credentials to server logs

### Changed
- TODOS.md: added P3 item tracking QB sandbox integration tests as a follow-up after multi-tenant expansion

## [0.2.2.0] - 2026-05-26

### Fixed
- Work order `updateStatus` Cancelled cascade is now atomic: `workOrder.update` and `workOrderItem.updateMany` run inside a single `$transaction`, eliminating the silent inconsistency where a process crash between the two ops left the work order Cancelled but its items in their prior status
- `updateShippingInfo` input schema now validates `shippingMethod` with `z.nativeEnum(ShippingMethod)` instead of `z.string()`, rejecting invalid enum values at the Zod layer before they reach Prisma; added `WorkOrderItemStatus` enum import so the Cancelled cascade uses the typed constant rather than a raw string literal
- Removed redundant `as ShippingMethod` casts in `order.ts` (two sites) now that `z.nativeEnum` guarantees the correct type at the input boundary

## [0.2.1.0] - 2026-05-26

### Added
- Work order router test suite: 22 tRPC procedure tests covering `getByID`, `createWorkOrder`, `getAll`, `updateStatus`, `addShippingInfo`, `convertWorkOrderToOrder`, `updateContactPerson`, and `updateShippingInfo`
- Work order conversion service test suite: 13 tests covering the `convertWorkOrderToOrder` transaction including artwork, ShippingInfo duplication, processing options, stock, and typesetting migration

### Fixed
- Silent `ShippingPickup` duplicate-create bug in `updateShippingInfo`: the upsert update arm now runs `deleteMany` before `create`, preventing duplicate rows on repeated saves
- Removed dead `calculateTotals` function from `workOrderToOrderService.ts` (formula was wrong — missing sales tax — and the router discarded the return value entirely)
- Removed redundant session guard in `createWorkOrder` (`protectedProcedure` middleware already enforces authentication before the handler runs)

### Changed
- Extracted `workOrderInclude` const in `workOrder.ts` as single source of truth for the Prisma include shape; eliminates 6× duplication and restores missing `ProductType` relation in `updateShippingInfo`
- `convertWorkOrderToOrder` service now returns `Promise<void>` instead of a partial `SerializedWorkOrder` (the return value was never used by the caller)
- Corrected directory name in `docs/ARCHITECTURE.md` from `missoula-v2/` to `irvine-v4/`

## [0.2.0.1] - 2026-05-26

### Added
- **`pretest` hook** — `pnpm test` now automatically runs `prisma generate` before the test suite, so tests work from a fresh clone without a manual generation step.

### Changed
- **TODOS.md** — Added new items from engineering review: `pretest` hook (now complete), workOrders router test suite (P2), version tracking Phase 2 instrumentation (P3), and CSR audit timeline UI (P3). Marked Invoice.invoiceNumber unique constraint as completed (constraint already existed in schema).

## [0.2.0.0] - 2026-05-26

### Added
- **Order version tracking** — Every status change on an order, order item, or invoice now writes an `OrderVersion` or `OrderItemVersion` record capturing who changed it, when, and what the previous and new statuses were. This powers audit trails and the printing API's status history queries.
- **`orderItemVersions` tRPC router** — Two new protected procedures: `getStatusHistory` (filter version records by order item and optional status list) and `getByOrderId` (fetch all version records for an order's items). Both include the `changedBy` user and sort chronologically.
- **`createVersion` shared utility** — `createOrderVersion`, `createOrderItemVersion`, and `buildChangedFields` are now a shared helper at `src/server/api/routers/shared/createVersion.ts`, ready for Phase 2 field-level change tracking.

### Changed
- **`orderItems.updateStatus`** — Pre-fetches the existing status before updating so the version record captures an accurate `previousStatus`.
- **`orders.updateStatus`** — Same pre-fetch pattern; records an `OrderVersion` entry after each status transition.
- **`invoices.create`** — Records an `OrderVersion` entry when an invoice is created and the order transitions to Invoiced status.

## [0.1.10.0] - 2026-04-21

### Added
- **tRPC router test suites** — two new Vitest suites cover the invoice and order routers: `generateInvoiceNumber` sequencing, `formatItemDescription` composition, `addPayment` Paid/Sent status transitions, `getById` NOT_FOUND, `updateStatus` item cascade for Cancelled/Completed/Invoiced/Pending, and NOT_FOUND propagation when a nested relation is missing.
- **Vitest global setup** — `src/test/setup.ts` mocks `~/server/db` and `~/server/auth` so router unit tests run without a database connection or real environment variables.

### Fixed
- **Upload route type safety** — `upload/route.ts` now uses `instanceof File` to narrow the `formData().get('file')` result instead of `as unknown as File`, correctly rejecting non-file form fields as 400.
- **Print preview type cast** — `OrderItemPrintPreview.tsx` removed the unnecessary `as unknown as` intermediate cast when iterating typesetting fields.
- **Invoice functions exported for testing** — `generateInvoiceNumber` and `formatItemDescription` in `invoice.ts` are now exported, enabling direct unit testing without router-level setup.

## [0.1.9.0] - 2026-04-20

### Changed
- **Standardized tRPC error handling** — new `src/server/api/errors.ts` provides `throwNotFound`, `throwForbidden`, `throwUnauthorized`, `throwConflict`, and `handlePrismaError` helpers used across all routers.
- **Global Prisma error middleware** — `withPrismaErrors` middleware now applied to every `publicProcedure` and `protectedProcedure`, converting Prisma P2025 to `NOT_FOUND`, P2002 to `CONFLICT`, and P2003 to `BAD_REQUEST` for the 20 routers that previously let database errors bubble as raw 500s.
- **Router updates** — `order.ts`, `invoice.ts`, `office.ts`, `roles.ts`, `workOrder.ts`, and `userManagement.ts` now use shared error helpers instead of inline `TRPCError` construction.

## [0.1.8.0] - 2026-04-20

### Added
- **`pnpm check:env` script** — new `scripts/check-env.js` validates that `.env.example` stays in sync with `src/env.js`. Exits non-zero if any variable is missing or stale. Run before onboarding new developers.
- **Shared `calculateItemTotals()` utility** — `src/utils/orderCalculations.ts` is now the single source of truth for all Decimal arithmetic across order/work order totals (item amount, shipping, cost, subtotal, sales tax, total amount).

### Fixed
- **Work order totals included sales tax inconsistently** — three mutation handlers in `workOrders/workOrder.ts` computed `totalAmount` as `itemAmount + shipping` without adding `calculatedSalesTax`. These now correctly compute `totalAmount = subtotal + salesTax` via the shared utility.

### Changed
- **`.env.example` updated to match `src/env.js`** — rewritten to include all 31 required environment variables (QuickBooks, Pusher, full SendGrid SMTP config, OpenAI, Honeybadger). Removed 6 stale entries (Discord, old SendGrid keys, unused Honeybadger fields).
- **Decimal calculations DRY'd across 3 routers** — replaced 12 duplicate inline calculation blocks in `order.ts`, `workOrder.ts`, and `company.ts` with calls to `calculateItemTotals()`.

## [0.1.7.0] - 2026-04-20

### Removed
- **T3 boilerplate scaffolding** — removed unused `Post` model from Prisma schema, `postRouter` from the tRPC root, and the `create-post.tsx` component. None of these were used in production.
- **Unused chart dependencies** — removed `ag-charts-react` and `ag-charts-community` from `package.json`. Both had zero imports across the codebase; the project uses Recharts for charts. Eliminates unnecessary Dependabot noise.
- **Bliss Pro legacy fonts** — removed 15 self-hosted Bliss Pro font files from `public/fonts/`, along with the `@font-face` declarations and `@theme` entries in `globals.css`. The body font was migrated to Inter in the Press Room redesign; the legacy entries were also shadowing standard Tailwind font-weight utilities (`font-bold`, `font-light`, `font-normal`) with Bliss Pro font-family values.
- **Shared `StatusBadge` component** — the generic `src/app/_components/shared/StatusBadge/StatusBadge.tsx` editing form has been removed. The status-change form logic is now inlined into `OrderDetailsComponent` and `ItemStatusBadge` where it is actually used, matching the pattern already in place for work order screens.

### Changed
- **README** — replaced T3 Create App boilerplate with project-specific overview: tech stack table, prerequisites, getting-started steps, available scripts, and links to the documentation suite.

## [0.1.6.0] - 2026-04-09

### Changed
- Dashboard card metadata fields now use a grid layout for better scanability
- Kanban column headers styled with border separator, uppercase text, and primary-colored count badges
- Filter bar spacing tightened with consistent padding across all filter components
- Dashboard title uses direct heading instead of DaisyUI navbar wrapper for tighter spacing
- Order item list bullets replaced with styled dots for a cleaner look
- Drag-and-drop info banner is now dismissible and persists the dismissed state across sessions
- Info banner hidden on mobile where drag-and-drop is not available

### Fixed
- Long order/PO numbers no longer blow out card width (truncated with ellipsis)
- Hardcoded `bg-gray-700` on OrderItemNumberFilter replaced with theme tokens for dark/light mode support
- React key warning: order item list uses `item.id` instead of array index for proper reconciliation
- Dismiss buttons now have proper `type="button"`, `aria-label`, and focus-visible ring for accessibility
- SSR hydration mismatch on banner dismiss state resolved by deferring localStorage read to useEffect
- Banner dismiss gracefully handles private browsing mode where localStorage is unavailable

## [0.1.5.0] - 2026-04-08

### Fixed
- Font-face declarations now use correct `format('opentype')` for `.otf` files instead of `format('woff2')`, and invalid `font-style` values (`bold`, `light`) replaced with proper CSS values
- Missing `width` and `height` on NoPermission page image, which caused layout shift
- Invoices page now uses the shared NoPermission component instead of an inline error div
- Breadcrumb "Home" link on invoices page uses Next.js `<Link>` for client-side navigation instead of a plain anchor tag

### Changed
- Loading spinner reduced from 128px to 40px and uses design system primary color instead of gray
- Empty work orders state now shows a warm message with icon and call-to-action instead of bare text
- Orders and invoices list pages aligned to the same layout pattern as work orders (semantic header, breadcrumbs, white card wrapper)

### Removed
- Commented-out "Create New Estimate" button from work orders page

## [0.1.4.2] - 2026-04-09

### Fixed
- Added missing `"use client"` directive to Button component (`button.tsx`) which imports `@radix-ui/react-slot`, a client-only API

## [0.1.4.1] - 2026-04-08

### Fixed
- Hydration mismatch error in NavBar caused by incorrect `"use server"` directive and nested component identity recreation on each render

## [0.1.4.0] - 2026-04-08

### Changed
- Orders table migrated from manual fetch to tRPC `useQuery` with proper loading, error, and empty states
- Status column now shows "Payment Received" (display-friendly) while filtering works correctly against both display and raw values
- AG Grid resize listener properly cleaned up on unmount via ref-based pattern, preventing memory leaks

### Fixed
- Status filter mismatch: "PaymentReceived" rendered as "Payment Received" but AG Grid filtered on the raw enum value, so searching for "Payment Received" returned no results
- Added error state UI so query failures show a clear message instead of an infinite skeleton loader
- Removed dead `onFilterChanged` handler and unused `FilterChangedEvent` import

## [0.1.3.0] - 2026-04-08

### Changed
- Dashboard cards now use the app's design system tokens (bg-card, bg-muted, text-muted-foreground) instead of hardcoded dark theme colors, so they respond to theme changes and match the rest of the app
- Typography hierarchy on dashboard cards: labels are smaller and muted, values are semibold, company name is the visual anchor
- Info banners use design system colors instead of light-mode blue that clashed with the dark kanban background
- Column headers now show item count badges
- Outsourced tab uses Building2 icon (instead of Mail) for company name, matching the other dashboard tabs

### Fixed
- Fixed `flex-column` typo to `flex flex-col` in OrderCard (was not applying flex layout)
- Replaced raw `<a>` tags with Next.js `<Link>` across all dashboard cards for client-side navigation

### Removed
- Eliminated 3x duplicated `calculateDaysUntilDue` and `jobBorderColor` functions by extracting to shared `src/utils/dashboardHelpers.ts`

## [0.1.2.0] - 2026-04-08

### Added
- Size field is now viewable and editable on the order item detail page, matching the pattern used by quantity, ink, cost, and amount fields
- Input validation for size: max 255 characters, whitespace trimming, empty string converts to null

## [0.1.1.1] - 2026-04-08

### Fixed
- Reverted Prisma generator config broken by commit 17d3f9e: restored `provider` to `prisma-client` and `output` to `../src/generated/prisma` so all 80+ source file imports resolve correctly

## [0.1.1.0] - 2026-04-08

### Changed
- Upgraded Prisma ORM from 6.x to 7.7.0 with PostgreSQL driver adapter (`@prisma/adapter-pg`)
- Migrated all 85+ source files from `@prisma/client` imports to generated client at `~/generated/prisma`
- Rewrote `src/server/db.ts` with `PrismaPg` driver adapter, exported `createPrismaClient` factory for scripts
- Updated all 10 standalone scripts (seed, imports, migrations) to use shared Prisma factory
- Refactored `qbCustomer.ts` to use `typeof db` instead of hard-coded Prisma generics
- Replaced `@prisma/client/runtime/library` imports with `decimal.js` and `~/generated/prisma/browser`
- Moved `prisma.seed` config from `package.json` to `prisma.config.ts`
- Made SSL conditional (production only) in database adapter config

### Added
- `prisma.config.ts` for Prisma 7 configuration (schema path, seed command, datasource)
- `vitest.config.ts` and test infrastructure with 3 targeted test suites
- Decimal serialization tests covering both `decimal.js` and `Prisma.Decimal` class instances
- `SKIP_ENV_VALIDATION=1` to all standalone script commands in `package.json`

## [0.1.0.1] - 2026-04-08

### Changed
- Reviewed 5 Dependabot PRs: merged safe patch (diff 4.0.2→4.0.4), closed 4 others requiring manual intervention
- Added Prisma 7 upgrade plan to TODOS.md with 4 tracks: schema/config, Auth.js adapter, internal runtime imports, CLI/scripts
- Added TODO to remove unused ag-charts-react dependency (zero imports in codebase)

## [0.1.0] - 2026-04-08

### Added
- **AI_CONTEXT.md** — project overview, domain terminology glossary, business concepts, tech stack summary
- **ARCHITECTURE.md** — tech stack with versions, annotated directory layout, 38 Prisma models grouped by domain, 32 tRPC routers table, auth & RBAC architecture, state management, third-party integrations
- **SYSTEM_DIAGRAM.md** — ASCII diagrams for high-level components, order lifecycle data flow, auth flow
- **REQUEST_FLOW.md** — request lifecycle, tRPC flow, QuickBooks sync flow, file upload flow, error handling
- **DEV_SETUP.md** — prerequisites, step-by-step setup, 31 environment variables table, useful commands, troubleshooting
- **AGENT_RULES.md** — AI-agent behavioral rules, context loading order, sensitive areas, migration rules, code patterns
- **ROADMAP.md** — vision (internal + external portal), current state, planned features, not-planned boundaries
- **TODOS.md** — technical debt with P0-P3 severity scale, planned improvements, deferred work with rationale
- **CHANGELOG.md** — this file, Keep a Changelog format
- **VERSION** — plain text version file (mirrors package.json)
