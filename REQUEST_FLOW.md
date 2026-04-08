# Request Flow — Thomson Print Portal

## Request Lifecycle Overview

```
Browser (React 19)
    │
    │  tRPC client call (e.g., api.orders.getById.useQuery())
    │
    ▼
src/trpc/react.tsx          ← tRPC + React Query client setup
    │
    │  HTTP POST to /api/trpc/[trpc]
    │
    ▼
src/app/api/trpc/[trpc]/route.ts   ← Next.js App Router API handler
    │
    │  Creates tRPC context (session, db)
    │
    ▼
src/server/api/trpc.ts      ← Context creation, middleware, procedure definitions
    │
    │  publicProcedure / protectedProcedure
    │
    ▼
src/server/api/routers/*    ← 32 domain routers (input validation via Zod)
    │
    │  Prisma query
    │
    ▼
src/server/db.ts            ← Prisma client singleton
    │
    │  SQL over TCP
    │
    ▼
PostgreSQL                   ← 38 models, 22 enums
    │
    │  Result
    │
    ▼
SuperJSON serialization      ← Handles Decimal, Date, BigInt, etc.
    │
    ▼
Browser (React Query cache)
```

## Auth Flow Details

### Providers (3)

1. **Google OAuth** — Primary SSO. Uses `allowDangerousEmailAccountLinking: true` to merge accounts by email.
2. **Email / Magic Link** — SendGrid SMTP transport. Sends branded HTML email with sign-in button. Notifies admin of new user attempts.
3. **Credentials** — Email/password with `bcryptjs`. Returns `RegisterRequired` error if user not found.

### JWT Strategy

NextAuth uses JWT (not database sessions for active auth). The flow:

1. **Sign in** → Provider authenticates → `jwt` callback fires → sets `token.sub = user.id`
2. **Every request** → `session` callback fires → fetches `User` with `Roles.Permissions` from DB → enriches session object
3. **Session shape:**
   ```typescript
   session.user.id          // string
   session.user.Roles       // RoleName[] (e.g., ["Admin", "Sales"])
   session.user.Permissions // string[] (e.g., ["CreateOrder", "UpdateWorkOrder"])
   ```

### RBAC Enforcement

Permissions are checked in tRPC procedures. Each role has a set of permissions (many-to-many via `Role ↔ Permission`). The session callback de-duplicates permissions across all user roles.

### Custom Pages

- **Error:** `/auth/error`
- **New User Registration:** `/users/registration`

## tRPC Lifecycle

### Client Side (`src/trpc/react.tsx`)

The tRPC client is configured with:
- **SuperJSON** transformer for serializing complex types (Decimal, Date)
- **React Query** integration for caching, deduplication, and background refetching
- HTTP batch link pointing to the API endpoint

### Server Side

1. **API Route** (`/api/trpc/[trpc]`) receives the batched request
2. **Context** is created: database client (`db`) + auth session (`getServerAuthSession()`)
3. **Middleware** runs: `publicProcedure` (no auth), `protectedProcedure` (requires session)
4. **Router** validates input with Zod schemas, executes Prisma queries
5. **Response** is serialized with SuperJSON and returned

### Router Organization

Routers live in `src/server/api/routers/` organized by domain:
- `orders/` — order, orderNotes
- `orderItems/` — orderItem
- `workOrders/` — workOrder, workOrderNote
- `workOrderItems/` — workOrderItem
- `invoices/` — invoice
- `quickbooks/` — qbAuth, qbCompany, qbCustomer, qbInvoice, qbSyncCustomer
- `shared/` — address, paperProducts, processingOptions, shippingInfo, shippingPickup, typesetting/*
- `companies/`, `contacts/`, `offices/`, `roles/`, `userManagement/`, `walkInCustomers/`

## QuickBooks Sync Flow

```
User initiates sync
    │
    ▼
qbAuth router              ← OAuth 2.0 flow with Intuit
    │
    │  Token stored on User model:
    │  quickbooksAccessToken, quickbooksRefreshToken,
    │  quickbooksRealmId, quickbooksTokenExpiry
    │
    ▼
quickbooksService.ts        ← Service layer for QB API calls
    │
    ▼
QB Sync Routers             ← qbCompany, qbCustomer, qbInvoice, qbSyncCustomer
    │
    │  Sync logic:
    │  1. Fetch from QB API
    │  2. Match by quickbooksId
    │  3. Create/update local records
    │  4. Store syncToken for conflict detection
    │
    ▼
Prisma (local DB)           ← Companies, Offices, Invoices with quickbooksId
```

### Synced Entities

| Local Model | QB Entity | Sync Direction | ID Field |
|-------------|-----------|---------------|----------|
| Company | Customer (parent) | Bidirectional | `quickbooksId` |
| Office | Customer (sub) | Bidirectional | `quickbooksCustomerId` |
| Invoice | Invoice | Bidirectional | `quickbooksId` |
| Order | Invoice | Push (via Invoice) | `quickbooksInvoiceId` |

### Token Management

QB OAuth tokens are stored per-user on the `User` model. Tokens are refreshed automatically when expired. The `quickbooksAuthState` field tracks the OAuth flow state.

## File Upload Flow

File uploads (artwork, proofs) go through Next.js API routes:
1. Client uploads file via form data
2. API route processes with `formidable`
3. File URL stored in artwork models (`OrderItemArtwork`, `WorkOrderItemArtwork`, `TypesettingProofArtwork`, `OutsourcedOrderItemInfoFile`)
4. `FileType` enum categorizes: Image, PDF, Excel, CSV, Word, RTF, JPEG, JPG, PNG, PSD, Other

## Error Handling

- **Honeybadger** — production error monitoring and alerting (`HONEYBADGER_API_KEY`)
- **tRPC errors** — structured error codes propagated to client via TRPCError
- **Zod validation** — input validation on every tRPC procedure, errors returned as 400s
- **Auth errors** — NextAuth redirects to `/auth/error` with error code

## Real-time Updates

**Pusher** provides WebSocket-based real-time updates. Configured via client env vars:
- `NEXT_PUBLIC_PUSHER_KEY` — app key
- `NEXT_PUBLIC_PUSHER_CLUSTER` — cluster region

Used for live notifications when orders/work orders are updated by other users.

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — tech stack and data model
- [SYSTEM_DIAGRAM.md](./SYSTEM_DIAGRAM.md) — visual component and flow diagrams
