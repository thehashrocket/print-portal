# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See [VERSION](./VERSION) for the current version.

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
