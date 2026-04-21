# Developer Setup — Thomson Print Portal

## Prerequisites

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | 24.2.0 | Pinned in `.nvmrc` — use `nvm use` |
| pnpm | 10.25.0 | Pinned in `package.json` `packageManager` field |
| PostgreSQL | Latest | Via Docker (recommended) or local install |
| Docker | Latest | Required for `start-database.sh` |

## Quick Start

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd luxembourg-v3

# 2. Use the correct Node version
nvm use

# 3. Install dependencies (also runs prisma generate via postinstall)
pnpm install

# 4. Set up environment
cp .env.example .env
# Fill in credentials (see Environment Variables below)

# 5. Start PostgreSQL via Docker
./start-database.sh

# 6. Push schema to database
pnpm db:push

# 7. Seed the database
pnpm db-seed

# 8. Start dev server (port 3005, Turbopack)
pnpm dev
```

## Environment Variables (31 total)

### Server Variables (23)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` / `test` / `production` |
| `NEXTAUTH_SECRET` | JWT signing secret (required in production) |
| `NEXTAUTH_URL` | Application base URL for NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PUBLIC_BASE_URL` | Public-facing application URL |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks OAuth app client ID |
| `QUICKBOOKS_CLIENT_SECRET` | QuickBooks OAuth app client secret |
| `QUICKBOOKS_ENVIRONMENT` | `sandbox` or `production` |
| `SENDGRID_ADMIN_EMAIL` | Admin notification recipient email |
| `SENDGRID_SMTP_USER` | SendGrid SMTP username |
| `SENDGRID_SMTP_PASSWORD` | SendGrid SMTP password (API key) |
| `SENDGRID_SMTP_HOST` | SendGrid SMTP host |
| `SENDGRID_SMTP_PORT` | SendGrid SMTP port (e.g., `465`) |
| `SENDGRID_EMAIL_FROM` | Sender email address for transactional emails |
| `SENDGRID_MAGIC_LINK_TEMPLATE_ID` | SendGrid template for magic link emails |
| `SENDGRID_ORDER_STATUS_TEMPLATE_ID` | SendGrid template for order status updates |
| `SENDGRID_ORDER_TEMPLATE_ID` | SendGrid template for order notifications |
| `WEBSITE_URL` | Thomson Printing public website URL |
| `HONEYBADGER_API_KEY` | Honeybadger error monitoring API key |
| `HONEYBADGER_ENV` | Honeybadger environment label (defaults to `development`) |

### Client Variables (8)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | Client-accessible base URL |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Client-accessible OpenAI key |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key for real-time |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region |
| `NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID` | Client-accessible QB client ID |
| `NEXT_PUBLIC_QUICKBOOKS_CLIENT_SECRET` | Client-accessible QB client secret |
| `NEXT_PUBLIC_QUICKBOOKS_ENVIRONMENT` | Client-accessible QB environment |
| `NEXT_PUBLIC_HONEYBADGER_API_KEY` | Client-accessible Honeybadger key |

Environment validation is enforced at build/dev time via `@t3-oss/env-nextjs` + Zod in `src/env.js`. Set `SKIP_ENV_VALIDATION=true` to bypass (useful for Docker builds).

## Running the Application

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on port 3005 with Turbopack hot reload |
| `pnpm build` | Production build (uses Webpack) |
| `pnpm start` | Serve production build on port 3000 |

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push Prisma schema changes to database |
| `pnpm db-seed` | Seed database with sample data |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm check:env` | Verify `.env.example` stays in sync with `src/env.js` |
| `pnpm generate-docs` | Regenerate API docs in `docs/api/` |
| `pnpm import-paper-products` | Import paper product catalog |
| `pnpm import-paper-catalog` | Import paper catalog data |
| `pnpm add-product-types` | Add product type records |
| `pnpm setup-walk-in` | Create the walk-in office for ad-hoc customers |
| `pnpm downcase-emails` | Normalize email addresses to lowercase |
| `pnpm copy-purchase-order-numbers` | Copy PO numbers between records |

## Database

### Docker Setup (`start-database.sh`)

The script:
1. Checks Docker is installed
2. Starts existing container if found, otherwise creates new one
3. Reads `DATABASE_URL` from `.env` to extract password
4. Offers to generate a random password if using the default
5. Runs `postgres` image on port 5432 with database name `thomson-print-portal`

### After Schema Changes

```bash
pnpm db:push          # Apply schema changes (no migration files)
# pnpm install runs prisma generate automatically via postinstall
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `env validation failed` | Check all required env vars in `.env`. Set `SKIP_ENV_VALIDATION=true` to bypass temporarily. |
| `prisma generate` errors | Run `pnpm install` (triggers postinstall). Check `DATABASE_URL` is set. |
| Port 3005 in use | Kill the process or change port in `pnpm dev` script. |
| Docker not found | Install Docker Desktop. On macOS: `brew install --cask docker`. |
| Database connection refused | Run `./start-database.sh` or `docker start thomson-print-portal-postgres`. |
| QB sync errors | Verify QB OAuth tokens are fresh. Re-authenticate via the QB auth flow in the app. |

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — tech stack and project structure
