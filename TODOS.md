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
No test framework is configured. All validation is manual (`pnpm lint` + smoke testing in dev). Risk: regressions go undetected until production.
- **Action:** Set up Vitest (or similar), add tests for critical paths (order CRUD, invoice generation, QB sync)
- **See:** [ROADMAP.md](./docs/ROADMAP.md) — High Priority

### P2 — README.md Cleanup
The current README is the T3 Create App boilerplate. It references Drizzle ORM (not used — this project uses Prisma) and contains generic T3 documentation instead of project-specific content.
- **Action:** Rewrite README with project-specific overview, linking to the documentation suite

### P2 — Post Model Cleanup
The `Post` model and `postRouter` are scaffolding from the T3 starter. They are not used in production features.
- **Action:** Remove `Post` model from schema, remove `postRouter` from root.ts, clean up any remaining references

### P2 — Unused Drizzle Reference
README references Drizzle ORM, but the project uses Prisma exclusively. No Drizzle dependencies exist.
- **Action:** Remove Drizzle references when rewriting README

### P3 — Consistent Error Handling
Error handling varies across routers — some throw TRPCError with codes, others let Prisma errors bubble up. Honeybadger is configured but not consistently used across all error paths.
- **Action:** Standardize error handling pattern across all 32 routers

### P3 — Environment Variable Documentation
`.env.example` should be kept in sync with `src/env.js`. Currently there's no automated check.
- **Action:** Add a CI check or script that validates `.env.example` has all vars from `env.js`

## Planned Improvements

### Test Coverage (linked to [ROADMAP.md](./docs/ROADMAP.md))
- Unit tests for tRPC routers (input validation, business logic)
- Integration tests for QuickBooks sync flow
- Component tests for critical UI flows (order creation, invoice generation)

### CI/CD Documentation Validation
- Automated check that cross-reference links in documentation files resolve
- Verify model/router counts match source files
- Lint markdown files for formatting consistency

### Type Safety Improvements
- Audit `as unknown as` and other type assertions
- Strengthen tRPC router return types (explicit instead of inferred from Prisma)
- Add runtime validation for QB webhook payloads

### P2 — Prisma 7 Upgrade
Prisma 6.19.2 → 7.x is a major upgrade that cannot be handled by Dependabot alone. Prisma 7 drops the Rust engine (faster, smaller runtime), adds native ESM, and moves to a driver-adapter architecture. The upgrade requires coordinated changes across schema, config, and client instantiation.
- **Track 1 — Schema & Config:**
  - `prisma/schema.prisma`: Change generator from `prisma-client-js` to `prisma-client`, add `output` path, remove `shadowDatabaseUrl`
  - Create `prisma.config.ts` for database connection configuration (env vars no longer auto-loaded)
  - Install `@prisma/adapter-pg` driver adapter
  - Update `src/server/db.ts`: Pass adapter to `PrismaClient` constructor
- **Track 2 — Auth.js Adapter:**
  - `@auth/prisma-adapter` (v2.11.1) still declares peer dep on `@prisma/client` v6 and imports PrismaClient from `@prisma/client`. Prisma 7's new output path may break this. Check for a compatible adapter version before upgrading, or pin the import path.
  - `src/server/auth.ts:76` uses `PrismaAdapter(db)` — verify this still works with the new client
- **Track 3 — Internal Prisma Runtime Imports:**
  - `src/app/invoices/[id]/page.tsx:7` imports `Decimal` from `@prisma/client/runtime/library`
  - `src/server/api/routers/quickbooks/qbCustomer.ts:7` imports `DefaultArgs` from `@prisma/client/runtime/library`
  - These runtime paths change in Prisma 7. Replace with equivalents from the generated output path.
- **Track 4 — CLI & Scripts:**
  - `db push` no longer auto-runs `prisma generate` in v7
  - `package.json` has `postinstall: prisma generate` and `prisma.seed` config — both need review
  - @prisma/adapter-pg changes pooling/SSL behavior — test against real Postgres
  - Bump both `prisma` and `@prisma/client` to 7.x together (version mismatch breaks builds)
- **Scope:** 85 files import `@prisma/client`, but most imports won't change. Main changes: schema, config, db.ts, auth.ts, and 2 files with runtime imports.
- **Dependabot PRs to close:** #423 (prisma CLI) and #424 (@prisma/client) — they only bump versions without the required code changes
- **Effort:** human ~3 days / CC ~45 min (increased from original estimate due to Auth.js adapter investigation)
- **Reference:** https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7

### P3 — Remove Unused ag-charts-react Dependency
`ag-charts-react` has zero imports in the codebase (verified across all .ts/.tsx/.js/.jsx files). The project uses `recharts` for charts and `@ag-grid-community/*` for grids. This dead dependency creates unnecessary Dependabot PRs and bloats install size.
- **Action:** Remove `ag-charts-react` from `package.json`, run `pnpm install`
- **Effort:** human ~5 min / CC ~2 min

## Deferred Work

### Migration to Prisma Migrate (Deferred)
Currently using `prisma db push` for schema changes. Prisma Migrate would provide version-controlled migration files, but the current approach works for the team size and deployment model. Revisit if team grows or deployment pipeline needs rollback capability.

### gait_context.md (Historical Artifact)
`gait_context.md` exists in the repo root with TypeScript type fix history. Kept as a historical reference — not integrated with the new documentation suite.

### Service Worker (`scripts/build-sw.js`)
A service worker build script exists but PWA features are not actively used. Keep the script but don't invest in PWA until the customer-facing portal is underway.

## See Also

- [ROADMAP.md](./docs/ROADMAP.md) — feature roadmap and vision
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — current architecture reference
