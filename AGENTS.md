# Repository Guidelines

## Project Structure & Module Organization
Routes live in `src/app` with feature dirs such as `src/app/orders`; shared UI belongs in `_components`. Hooks sit in `src/hooks`, helpers in `src/lib` and `src/utils`, and Zustand stores in `src/store`. Server routers, auth, and Prisma access live in `src/server`, while integrations sit in `src/services`. Prisma schema and seeds live in `prisma/`; static assets in `public/`, generated docs in `docs/api`, and automation scripts in `scripts/`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (use the Node version from `.nvmrc`).
- `pnpm dev` — run the app on port 3005 with Turbopack hot reload.
- `pnpm build` / `pnpm start` — create and serve the production bundle.
- `pnpm lint` — execute ESLint with the Next.js config; resolve all output.
- `pnpm db:push`, `pnpm db-seed`, `pnpm db:studio` — sync Prisma schema, load sample data, and inspect the database.
- `pnpm generate-docs` — regenerate the API docs in `docs/api`.

## Coding Style & Naming Conventions
Write TypeScript with ES imports and two-space indentation. Components use PascalCase filenames, hooks start with `use`, and utilities stay camelCase. Prettier with `prettier-plugin-tailwindcss` orders Tailwind classes—run the formatter instead of hand-sorting. Keep React components pure, annotate server boundaries, and colocate feature styles.

## Architecture & SOLID Practices
Model features with single-purpose modules and narrow interfaces. Depend on abstractions—inject services into components instead of instantiating Prisma or API clients. Extend via composition, keep return contracts compatible, split interfaces per consumer, and invert dependencies with factories or providers; note deliberate exceptions in the PR.

## Testing Guidelines
Tests are not wired up yet, so run `pnpm lint` and smoke critical flows in `pnpm dev` (orders, invoices, QuickBooks sync) before pushing. If you add automation, keep `.test.ts` beside the feature, document the run command, and list manual QA steps in the PR.

## Commit & Pull Request Guidelines
Write imperative, focused commits (e.g., “Add invoice aging widget”) and isolate dependency bumps. PRs need a short summary, UI screenshots or Loom for visual changes, migration or seed notes, links to tracking issues, and any scripts teammates must run.

## Environment & Data Setup
Copy `.env.example` to `.env`, supply credentials, then run `./start-database.sh` to launch local Postgres. `pnpm install` triggers `prisma generate`; re-run after schema edits. Use `scripts/` helpers (e.g., `pnpm import-paper-products`) for bulk loads and never commit secrets or `.env`.
