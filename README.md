# Thomson Print Portal

Internal print job management system for **Thomson Printing, Inc.** (St. Charles, MO). Digitizes the full production lifecycle from customer quote through invoicing, replacing manual paper-based processes.

## What It Does

Staff at Thomson Printing use this portal to manage:

- **Work order → Order → Invoice** lifecycle with per-item status tracking
- **Typesetting & proofing** with multi-iteration approval workflows
- **Production status** across Prepress, Press, Bindery, and Shipping stages
- **Paper product catalog** (brand × type × finish × weight for HP Indigo and offset)
- **QuickBooks Online sync** — customers, invoices, and payments, bidirectional
- **Shipping** with FedEx, UPS, USPS, DHL, and courier tracking
- **Walk-in customers** for ad-hoc orders without a Company record
- **RBAC** — 9 roles (Admin, Sales, Prepress, Bindery, Finance, Manager, etc.) with 45 granular permissions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| API | tRPC v11 + SuperJSON |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Database | PostgreSQL |
| Auth | NextAuth v4 (JWT · Google OAuth · Magic Link) |
| UI | Tailwind CSS v4, custom "Press Room" design system |
| Components | shadcn/ui, Radix primitives, AG Grid Community |
| State | Zustand, Jotai |
| Real-time | Pusher |
| Email | SendGrid (Nodemailer SMTP) |
| PDF | jsPDF |
| Monitoring | Honeybadger |
| Integration | QuickBooks Online (`intuit-oauth`) |
| AI | OpenAI |

## Prerequisites

- Node.js **24.2.0** (`nvm use 24.2.0`)
- pnpm **10.x**
- PostgreSQL (Docker recommended — see `./start-database.sh`)

## Getting Started

```bash
nvm use 24.2.0
pnpm install
cp .env.example .env       # fill in all required values (see below)
./start-database.sh        # start Postgres via Docker
pnpm db:push               # apply Prisma schema + generate client
pnpm db-seed               # optional: seed sample data
pnpm setup-walk-in         # optional: create the walk-in customer office
pnpm dev                   # http://localhost:3005
```

> **Note:** The Prisma client is generated to `src/generated/prisma`, not `node_modules/@prisma/client`. Run `pnpm db:push` after pulling changes that touch `prisma/schema.prisma`.

## Environment Variables

Copy `.env.example` to `.env` and fill in each value. All variables are validated at startup via `@t3-oss/env-nextjs` + Zod — a missing variable will fail the build. Use `SKIP_ENV_VALIDATION=1` for one-off scripts.

| Group | Variables |
|-------|-----------|
| Database & Auth | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| App URLs | `PUBLIC_BASE_URL`, `NEXT_PUBLIC_BASE_URL`, `WEBSITE_URL` |
| QuickBooks | `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `QUICKBOOKS_ENVIRONMENT` (+ `NEXT_PUBLIC_*` variants) |
| SendGrid | `SENDGRID_SMTP_*`, `SENDGRID_EMAIL_FROM`, `SENDGRID_ADMIN_EMAIL`, template IDs for magic link / order notifications |
| OpenAI | `OPENAI_API_KEY`, `NEXT_PUBLIC_OPENAI_API_KEY` |
| Pusher | `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` |
| Honeybadger | `HONEYBADGER_API_KEY`, `HONEYBADGER_ENV`, `NEXT_PUBLIC_HONEYBADGER_API_KEY` |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with Turbopack (port 3005) |
| `pnpm build` | Production build (Webpack) |
| `pnpm start` | Serve production build (port 3000) |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm db:push` | Push schema changes + regenerate Prisma client |
| `pnpm db:studio` | Prisma Studio GUI |
| `pnpm db-seed` | Seed sample data |
| `pnpm check:env` | Verify `.env.example` stays in sync with `src/env.js` |
| `pnpm generate-docs` | Regenerate API reference in `docs/api/` |
| `pnpm import-paper-products` | Import paper catalog from CSV |
| `pnpm import-quickbooks` | One-time QB customer/invoice import |
| `pnpm setup-walk-in` | Create walk-in office record |

## Project Structure

```
src/
├── app/
│   ├── _components/     # Shared UI + Press Room design system
│   ├── api/             # tRPC routes, auth, file uploads
│   ├── companies/       # Company + contact management
│   ├── dashboard/       # Kanban and summary views
│   ├── invoices/        # Invoice creation, QB sync
│   ├── orders/          # Order management (AG Grid tables)
│   ├── users/           # User + role management
│   └── workOrders/      # Work order management + typesetting
├── server/
│   ├── api/             # 32 tRPC routers
│   ├── auth.ts          # NextAuth config
│   └── db.ts            # Prisma client singleton
├── services/            # QuickBooks OAuth + API service
├── hooks/               # Custom React hooks
├── store/               # Zustand global state
├── utils/               # Currency (Decimal.js), formatting, calculations
└── test/                # Vitest setup + shared mocks
```

## Data Model

38 Prisma models, 22 enums. Core models:

- **WorkOrder** → **Order** → **OrderItem** (with `OrderItemArtwork`, `OrderItemStock`)
- **Typesetting** → **TypesettingProof** → **TypesettingOption**
- **Invoice** → **InvoiceItem** → **InvoicePayment**
- **Company** → **Office** → **UsersOnOffices**
- **ShippingInfo**, **ShippingPickup**
- **User**, **Role**, **Permission** (RBAC)
- **PaperProduct**, **ProductType**

All currency fields use `Decimal(10,2)` via `Decimal.js` for precision.

## Key Architecture Notes

- **Error handling:** Global Prisma middleware converts `P2025` → `NOT_FOUND` and `P2002` → `CONFLICT` TRPCErrors across all routers.
- **QB tokens:** QuickBooks OAuth tokens are stored per user on the `User` model. Refresh tokens expire and require re-auth.
- **Design system:** New components use custom "Press Room" OKLCH color tokens — avoid raw Tailwind color utilities in new code.
- **Tests:** Vitest mocks `~/server/db` and `~/server/auth` globally; router tests run without a database connection.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — tech stack, directory layout, data model
- [Design System](./docs/DESIGN.md) — Press Room tokens, component patterns
- [Dev Setup](./docs/DEV_SETUP.md) — detailed local setup guide
- [Roadmap](./docs/ROADMAP.md) — planned features and priorities
- [Request Flow](./docs/REQUEST_FLOW.md) — tRPC request lifecycle
- [API Docs](./docs/api/README.md) — generated router/procedure reference
