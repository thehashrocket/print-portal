# Agent Rules — Thomson Print Portal

> **Read [AGENTS.md](./AGENTS.md) first.** It covers general repo guidelines (build commands, code style, commit conventions). This file covers AI-agent-specific behavioral rules.

## Context Loading Order

When starting a session, load context in this order:

1. **[AI_CONTEXT.md](./AI_CONTEXT.md)** — what this project is, domain terminology, business concepts
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — tech stack, data model, directory layout, routers
3. **Feature-area files** — read the specific routers, components, and schema sections relevant to the task

This order gives you domain understanding before diving into implementation details.

## Sensitive Areas

These areas require extra care. Read thoroughly before modifying, and call out changes in PRs.

### Authentication (`src/server/auth.ts`)
- 3 providers (Google, Email, Credentials) with JWT strategy
- Session callback enriches with roles/permissions on every request
- Changing the session shape breaks all RBAC checks downstream
- `allowDangerousEmailAccountLinking: true` on Google provider is intentional

### Database Migrations (`prisma/schema.prisma`)
- **Never** drop columns or tables without confirming no code references them
- **Never** rename fields without updating all tRPC routers and components that reference them
- Use `pnpm db:push` for development schema changes (no migration files in this project)
- Always check that enum value additions are backward-compatible
- The `deleted` soft-delete pattern is used on: Address, Company, Office, OrderItem, OrderItemStock, PaperProduct, ProductType, User, WorkOrderItem

### QuickBooks Integration (`src/services/`, QB routers)
- `quickbooksId` and `syncToken` fields are owned by QuickBooks — do not generate or modify these values
- OAuth tokens on the User model are sensitive — never log or expose them
- The QB environment (`sandbox` vs `production`) affects real financial data
- Test QB changes against sandbox first

### Environment Validation (`src/env.js`)
- All 31 env vars are validated with Zod at build/dev time
- Adding a new env var requires updating: `server`/`client` schema, `runtimeEnv` mapping, and `.env.example`
- Forgetting any of these three breaks the build

## Migration Rules

1. **Schema changes:** Edit `prisma/schema.prisma` → run `pnpm db:push` → verify with `pnpm db:studio`
2. **No migration files:** This project uses `db push` (not `prisma migrate`). There is no `prisma/migrations/` directory.
3. **Seed updates:** If adding models that need default data, update `prisma/seed.ts`
4. **Enum additions:** Adding values to enums is safe. Removing or renaming values is breaking.

## Testing Expectations

- No test framework is configured yet (captured in [TODOS.md](./TODOS.md))
- Run `pnpm lint` before every commit
- Smoke test critical flows in `pnpm dev`: orders, invoices, QuickBooks sync
- List manual QA steps in PR descriptions for UI changes

## Code Patterns to Follow

### tRPC Routers
- Input validation: always use Zod schemas on `.input()`
- Use `protectedProcedure` for any mutation or sensitive query
- Return shaped data, not raw Prisma results with unnecessary relations
- Router files live in `src/server/api/routers/{domain}/`

### Components
- Feature pages live in `src/app/{feature}/` (App Router)
- Shared components in `src/app/_components/`
- Use shadcn/ui primitives (Radix-based) for UI building blocks
- Tailwind CSS for styling — run Prettier to auto-sort classes

### State Management
- Server state: tRPC + React Query (default, prefer this)
- Global client state: Zustand (`src/store/`)
- Component-scoped shared state: Jotai
- Feature-scoped providers: React Context (`src/app/contexts/`)

### Soft Deletes
Many models use `deleted: Boolean @default(false)` instead of hard deletes. When querying these models, filter by `deleted: false` unless explicitly showing archived records.

## What Not to Do

- **Don't** modify `AGENTS.md` — it's the repo-wide guideline file maintained separately
- **Don't** commit `.env` files or secrets
- **Don't** bypass env validation (`SKIP_ENV_VALIDATION`) in production
- **Don't** modify QuickBooks sync logic without understanding the full sync flow in [REQUEST_FLOW.md](./REQUEST_FLOW.md)
- **Don't** add new dependencies without checking if an existing one covers the use case (the project already has: lodash, dayjs, decimal.js, zod, react-hook-form)

## See Also

- [AGENTS.md](./AGENTS.md) — general repository guidelines
- [AI_CONTEXT.md](./AI_CONTEXT.md) — project overview and domain terminology
- [ARCHITECTURE.md](./ARCHITECTURE.md) — technical architecture reference
