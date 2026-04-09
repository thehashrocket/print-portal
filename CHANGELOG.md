# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See [VERSION](./VERSION) for the current version.

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
