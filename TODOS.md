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

### P3 — DRY Decimal Total Calculations
Multiple tRPC routers (orders, workOrders, companies) have duplicated Decimal arithmetic for computing totals. Extract a shared utility.
- **Action:** Create shared `calculateOrderTotals()` utility, update routers to use it

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

## Completed

### P2 — Prisma 7 Upgrade
Prisma 6.19.2 → 7.7.0 migration with driver adapter architecture, generated client output, shared factory for scripts, Decimal BYOL handling.
- **Completed:** v0.1.1.0 (2026-04-08)

## See Also

- [ROADMAP.md](./docs/ROADMAP.md) — feature roadmap and vision
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — current architecture reference
