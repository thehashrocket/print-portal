# Thomson Print Portal

A full-stack print shop management application built with Next.js, tRPC, Prisma, and PostgreSQL. Manages orders, work orders, invoices, companies, contacts, and QuickBooks Online sync.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **API:** tRPC v11 + SuperJSON
- **ORM:** Prisma 7 (PostgreSQL)
- **Auth:** NextAuth (JWT, credentials + OAuth)
- **UI:** Tailwind CSS v4, DaisyUI, shadcn/ui
- **Email:** SendGrid
- **Integration:** QuickBooks Online (intuit-oauth)
- **PDF:** jsPDF
- **Monitoring:** Honeybadger

## Prerequisites

- Node.js 24.2.0 (via nvm: `nvm use 24.2.0`)
- pnpm 10.x
- PostgreSQL (Docker recommended)

## Getting Started

```bash
nvm use 24.2.0
pnpm install
cp .env.example .env   # fill in required values
pnpm db:push           # apply schema to database
pnpm db-seed           # optional: seed with sample data
pnpm dev               # starts on http://localhost:3005
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack, port 3005) |
| `pnpm build` | Production build |
| `pnpm db:push` | Generate Prisma client + push schema |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm test` | Run Vitest test suite |
| `pnpm generate-docs` | Generate API docs to `docs/api/` |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — tech stack, directory layout, data model
- [Design System](./docs/DESIGN.md) — component library, tokens, patterns
- [Dev Setup](./docs/DEV_SETUP.md) — detailed local setup guide
- [Roadmap](./docs/ROADMAP.md) — planned features and priorities
- [Request Flow](./docs/REQUEST_FLOW.md) — tRPC request lifecycle
- [API Docs](./docs/api/README.md) — generated router/procedure reference
