# TODOs — Thomson Print Portal

## Severity Scale

| Severity | Definition |
|----------|-----------|
| **P0** | Blocks production or causes data loss |
| **P1** | Significant user-facing issue or security concern |
| **P2** | Quality/maintainability issue, should fix soon |
| **P3** | Nice-to-have improvement, fix when convenient |

## Technical Debt

### P1 — Test Infrastructure
Vitest is configured with 3 test suites (Decimal serialization, db client, work order calculations). Expand coverage to critical paths.
- **Action:** Add tests for order CRUD, invoice generation, QB sync
- **See:** [ROADMAP.md](./docs/ROADMAP.md) — High Priority
- **Partial (2026-04-21):** Added 15 new tests across 2 new suites:
  - `src/server/api/routers/invoices/__tests__/invoice.test.ts` — `generateInvoiceNumber` (3), `formatItemDescription` (3), `addPayment` status logic (2), `getById` NOT_FOUND (1)
  - `src/server/api/routers/orders/__tests__/order.test.ts` — `updateStatus` cascade to items for Cancelled/Completed/Invoiced/Pending (4), `order.update` called correctly (1), `getByID` null for missing order (1)
  - Added `src/test/setup.ts` vitest setup file (mocks `~/server/db` and `~/server/auth` so router tests don't require real env vars)
- **Partial (2026-05-26):** Added 61 total tests across 5 suites (includes above plus):
  - `src/server/api/routers/orderItemVersions/__tests__/orderItemVersions.test.ts` — `getStatusHistory` and `getByOrderId` procedure coverage
  - `src/server/api/routers/orderItems/__tests__/orderItem.test.ts` — `updateStatus` version write instrumentation
  - `src/server/api/routers/shared/__tests__/createVersion.test.ts` — `buildChangedFields`, `createOrderVersion`, `createOrderItemVersion` unit coverage
  - Remaining: QB sync integration tests, component tests for order creation/invoice generation

### P1 — Fix broken local test invocation (`pretest` hook)
`pnpm test` fails on a fresh environment because `~/generated/prisma/client` doesn't exist until `prisma generate` runs. CI executes `pnpm dlx prisma generate` before tests (so CI passes), but there's no local equivalent — any dev who clones fresh, runs `git clean`, or switches branches sees 9 module-not-found failures and can't tell if the suite is broken or just ungenerated.
- **Action:** Add `"pretest": "prisma generate"` to `package.json`. One-line change, matches CI behavior exactly. Adds ~150ms to every local test run.
- **Why now:** Will hit every developer the first time they try to run tests locally.
- **Depends on:** Nothing — standalone fix.
- **Completed:** 2026-05-26

### P2 — Add workOrders router test suite
`src/server/api/routers/workOrders/workOrder.ts` is 578 lines with zero test coverage. It handles the work order → order conversion pipeline, work order item management, and totals calculations — a core business flow. A silent regression (wrong totals, missing items, bad status cascade) creates billing errors that are invisible until a user reports them.
- **Action:** Create `src/server/api/routers/workOrders/__tests__/workOrder.test.ts` using the established pattern (vitest + mock db via `src/test/setup.ts` + `createCallerFactory`). Priority cases: WO→order conversion totals, item status cascade, `calculateItemTotals` integration.
- **Why now:** The test pattern is established from orders/orderItems — this isn't starting from scratch. The WO→order path is the highest-risk untested flow.
- **Depends on:** `src/test/setup.ts` (already exists).
- **Completed:** 2026-05-26 — Added 22 router tests + 13 service tests (35 total). Also fixed: (1) extracted `workOrderInclude` const eliminating 6x duplication and fixing missing `ProductType` in `updateShippingInfo`; (2) fixed silent `ShippingPickup` duplicate-create bug in `updateShippingInfo` update arm; (3) deleted dead `calculateTotals` function from `workOrderToOrderService.ts` (wrong formula, router discarded the return value). Suite now at 92 tests.

### P2 — README.md Cleanup
The current README is the T3 Create App boilerplate. It references Drizzle ORM (not used — this project uses Prisma) and contains generic T3 documentation instead of project-specific content.
- **Action:** Rewrite README with project-specific overview, linking to the documentation suite
- **Completed:** 2026-04-20

### P2 — Post Model Cleanup
The `Post` model and `postRouter` are scaffolding from the T3 starter. They are not used in production features.
- **Action:** Remove `Post` model from schema, remove `postRouter` from root.ts, clean up any remaining references
- **Completed:** 2026-04-20

### P2 — Unused Drizzle Reference
README references Drizzle ORM, but the project uses Prisma exclusively. No Drizzle dependencies exist.
- **Action:** Remove Drizzle references when rewriting README
- **Completed:** 2026-04-20 (fixed as part of README rewrite)

### P3 — Consistent Error Handling
Error handling varies across routers — some throw TRPCError with codes, others let Prisma errors bubble up. Honeybadger is configured but not consistently used across all error paths.
- **Action:** Standardize error handling pattern across all 32 routers
- **Completed:** 2026-04-20 — Created `src/server/api/errors.ts` with `throwNotFound/throwForbidden/throwUnauthorized/throwConflict/handlePrismaError` helpers. Added `withPrismaErrors` middleware to `trpc.ts` applied to all procedures globally (converts Prisma P2025→NOT_FOUND, P2002→CONFLICT, P2003→BAD_REQUEST). Updated order.ts, invoice.ts, office.ts, roles.ts, workOrder.ts, userManagement.ts to use helpers instead of inline TRPCError construction.

### P3 — Environment Variable Documentation
`.env.example` should be kept in sync with `src/env.js`. Currently there's no automated check.
- **Action:** Add a CI check or script that validates `.env.example` has all vars from `env.js`
- **Completed:** 2026-04-20 — Rewrote `.env.example` with all 31 vars. Added `scripts/check-env.js` and `pnpm check:env` script.

### P3 — workOrderRouter: non-atomic Cancelled cascade
`updateStatus` in `workOrder.ts` runs two separate DB operations — `workOrder.update` then `workOrderItem.updateMany`. If the process fails between them, work order shows Cancelled but items retain their prior status (silent inconsistency).
- **Action:** Wrap both operations in a `ctx.db.$transaction` call so they succeed or fail together.
- **Note:** Pre-existing issue, low probability in single-tenant usage. Revisit before multi-tenant expansion.
- **Completed:** 2026-05-26

### P3 — workOrderRouter: `shippingMethod` input should use `z.nativeEnum(ShippingMethod)`
`updateShippingInfo` input schema uses `z.string()` for `shippingMethod` and casts with `as ShippingMethod` at two call sites (`workOrder.ts` lines 338, 352). The orders router uses `z.nativeEnum(ShippingMethod)` (correct pattern). Using `z.string()` allows invalid enum values through to a Prisma type cast with no runtime error.
- **Action:** Import `ShippingMethod` enum value (not just the type) from `~/generated/prisma/client`, change `z.string()` to `z.nativeEnum(ShippingMethod)`, and remove both `as ShippingMethod` casts.
- **Completed:** 2026-05-26 — Also removed redundant `as ShippingMethod` casts from `order.ts` (lines 953, 976) for consistency.

## Planned Improvements

### P3 — QB Sandbox Integration Tests
Unit tests with mocked axios verify error paths and payload shape. They do NOT
verify that the QB API actually accepts our payload. True integration tests
require QB credentials in CI (QB_CLIENT_ID, QB_CLIENT_SECRET, QB_REALM_ID from
a sandbox company) and OAuth token management in fixtures.
- **Action:** Add QB sandbox credentials to CI secrets. Write integration test
  suite that hits the QB sandbox API for: create invoice, sync invoice, create
  customer. Verify round-trip (create in our DB → push to QB → QB returns valid ID).
- **Depends on:** CI environment setup, QB sandbox company with valid credentials.
- **Note:** Low urgency — unit tests cover the error-path risk. Integrate before
  multi-tenant expansion where QB sync failures affect multiple customers.

### Test Coverage (linked to [ROADMAP.md](./docs/ROADMAP.md))
- Unit tests for tRPC routers (input validation, business logic)
- Integration tests for QuickBooks sync flow
- Component tests for critical UI flows (order creation, invoice generation)

### CI/CD Documentation Validation
- Automated check that cross-reference links in documentation files resolve
- Verify model/router counts match source files
- Lint markdown files for formatting consistency

### Type Safety Improvements
- Audit `as unknown as` and other type assertions — **Partial (2026-04-21):** Removed `as unknown as` from `upload/route.ts` (replaced with `instanceof File` guard) and `OrderItemPrintPreview.tsx` (downgraded to single-step `as Record<string, unknown>`). The `db.ts` usage is standard T3 `globalThis` boilerplate, acceptable as-is.
- Strengthen tRPC router return types (explicit instead of inferred from Prisma)
- Add runtime validation for QB webhook payloads

### P2 — Invoice Number Race Condition
`generateInvoiceNumber` in `src/server/api/routers/invoices/invoice.ts` reads the last invoice number and creates with the incremented value in two separate, non-atomic DB operations. Concurrent requests can read the same `lastInvoice` and produce duplicate `invoiceNumber` values.
- **Action:** Add a unique constraint on `Invoice.invoiceNumber` in Prisma schema (already enforced at app level by the sequential query, but DB-level enforcement catches concurrent races and returns P2002/CONFLICT rather than creating a duplicate)
- **Note:** Low probability in practice given single-tenant usage, but worth hardening before multi-tenant expansion
- **Completed:** 2026-05-26 — `prisma/schema.prisma` line 70 already has `invoiceNumber String @unique`. DB-level enforcement is in place.

### P3 — DRY Decimal Total Calculations
Multiple tRPC routers (orders, workOrders, companies) have duplicated Decimal arithmetic for computing totals. Extract a shared utility.
- **Action:** Create shared `calculateOrderTotals()` utility, update routers to use it
- **Completed:** 2026-04-20 — Created `src/utils/orderCalculations.ts` with `calculateItemTotals()`. Replaced 12 duplicate blocks across order.ts (5), workOrder.ts (5), company.ts (2). Also fixed a bug in 3 workOrder mutation handlers where `totalAmount` was computed without sales tax.

### P3 — Remove Unused ag-charts-react Dependency
`ag-charts-react` has zero imports in the codebase (verified across all .ts/.tsx/.js/.jsx files). The project uses `recharts` for charts and `@ag-grid-community/*` for grids. This dead dependency creates unnecessary Dependabot PRs and bloats install size.
- **Action:** Remove `ag-charts-react` from `package.json`, run `pnpm install`
- **Completed:** 2026-04-20 (also removed `ag-charts-community` which was equally unused)

### P3 — OrderVersion / OrderItemVersion Retention Policy
`OrderVersion` and `OrderItemVersion` tables grow indefinitely with no current archival strategy. At high order volume this will affect query performance and storage costs.
- **Action:** Add a monitoring alert when either table exceeds a row-count threshold (e.g. 500k rows). Implement a `scripts/archive-versions.ts` script using `deleteMany` to archive records older than a configurable window (e.g. 2 years). Schedule as a cron job once usage volume warrants it.
- **Note:** Low urgency for current single-tenant scale; revisit before multi-tenant expansion or if `@@index` queries begin degrading.

### P3 — Version Tracking Phase 2: instrument non-status mutations with changedFields
- **Completed:** 2026-05-26 — Instrumented all 9 non-status mutation sites: `order.ts` (`updateDeposit`, `updateContactPerson`, `updateNotes`, `updateFields`, `updateShippingInfo`) and `orderItem.ts` (`updateDescription`, `updateSpecialInstructions`, `updateFields`, `updateShippingInfo`). Each fetches the current record before the update and calls `buildChangedFields(before, after)` to produce the diff. Also removed 2 stray `console.log` statements in `updateShippingInfo`.

### P3 — Version Tracking UI: CSR audit timeline
- **Completed:** 2026-05-26 — Added `orderVersionsRouter` (`src/server/api/routers/orderVersions/index.ts`) with `getByOrderId` query. Added collapsible `OrderAuditTimeline` component (`src/app/_components/orders/OrderAuditTimeline/OrderAuditTimeline.tsx`) to Order Detail page. Timeline merges `OrderVersion` and `OrderItemVersion` records sorted by `changedAt`, showing timestamp, user, status transitions, and field-level from/to diffs. Lazy-loads on first expand.

## Deferred Work

### Migration to Prisma Migrate (Deferred)
Currently using `prisma db push` for schema changes. Prisma Migrate would provide version-controlled migration files, but the current approach works for the team size and deployment model. Revisit if team grows or deployment pipeline needs rollback capability.

### gait_context.md (Historical Artifact)
`gait_context.md` exists in the repo root with TypeScript type fix history. Kept as a historical reference — not integrated with the new documentation suite.

### Service Worker (`scripts/build-sw.js`)
A service worker build script exists but PWA features are not actively used. Keep the script but don't invest in PWA until the customer-facing portal is underway.

## Press Room Redesign (post-migration cleanup)

### P2 — Delete StatusBadge after migration complete
`StatusBadge` at `src/app/_components/shared/StatusBadge/StatusBadge.tsx` is being kept alive during the redesign migration. New screens use the new `Pill` component. Once all screens (Dashboard, Orders, Order Detail, Work Orders, Create WO) are migrated, `StatusBadge` is dead code.
- **Action:** `grep -r "StatusBadge" src/` to find remaining imports. Remove them. Delete the component and its directory.
- **Completed:** 2026-04-20 — Inlined the editing form into `OrderStatusBadge` (OrderDetailsComponent) and `ItemStatusBadge`. Deleted `src/app/_components/shared/StatusBadge/`.

### P3 — Remove Bliss Pro font files after migration complete
`public/fonts/` contains self-hosted Bliss Pro font files. Phase 0 of the redesign replaces the body font with Inter (via next/font). Once migration is complete and no component references `font-sans`, `font-light`, `font-bold`, `font-italic` Tailwind classes pointing to Bliss Pro, these files can be removed.
- **Action:** `grep -r "font-sans\|font-light\|font-bold\|font-italic" src/` — confirm zero hits. Remove the Bliss Pro entries from `@theme` in `globals.css`. Delete `public/fonts/` Bliss Pro files.
- **Completed:** 2026-04-20 — Verified zero usages of Bliss Pro-specific class names (`font-italic`, `font-light-bold`). The `--font-light/bold/normal` entries in `@theme` were shadowing standard Tailwind weight utilities (a bug). Removed all Bliss Pro `@theme` entries and `@font-face` declarations from `globals.css`. Deleted `public/fonts/`.

## Completed

### P3 — Audit Radix Components for Hydration Mismatches
Audited all 14 files importing from `@radix-ui/*`. Found `button.tsx` missing `"use client"` directive (imports `@radix-ui/react-slot`). All other Radix UI wrapper components and consumer components already had proper client boundaries. Fixed `button.tsx` by adding the directive.
- **Completed:** 2026-04-08

### P2 — Prisma 7 Upgrade
Prisma 6.19.2 → 7.7.0 migration with driver adapter architecture, generated client output, shared factory for scripts, Decimal BYOL handling.
- **Completed:** v0.1.1.0 (2026-04-08)

## See Also

- [ROADMAP.md](./docs/ROADMAP.md) — feature roadmap and vision
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — current architecture reference
