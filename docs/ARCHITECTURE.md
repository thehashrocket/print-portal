# Architecture — Thomson Print Portal

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.3 |
| Language | TypeScript | 5.9.3 |
| API | tRPC + SuperJSON | 11.x |
| ORM | Prisma | 7.7.0 |
| Database | PostgreSQL | (Docker) |
| Auth | NextAuth (JWT strategy) | 4.24.x |
| UI | Tailwind CSS + shadcn/ui + DaisyUI | 4.x |
| Icons | Lucide React | 0.548.x |
| State | Zustand, Jotai, React Context | — |
| Data Grids | AG Grid + AG Charts | 32.x–35.x / 12.x–13.x |
| Charts | Recharts | 3.x |
| Email | SendGrid (SMTP via Nodemailer) | — |
| Real-time | Pusher | — |
| PDF | jsPDF | 4.x |
| Monitoring | Honeybadger | — |
| Integration | QuickBooks Online (intuit-oauth) | — |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Runtime | Node.js | 24.2.0 |
| Package Manager | pnpm | 10.25.0 |

## Directory Layout

```
luxembourg-v3/
├── prisma/
│   ├── schema.prisma          # 38 models, 22 enums
│   ├── seed.ts                # Database seeding
│   ├── import-quickbooks.js   # QB data import
│   └── import-compass-health-locations.js
├── public/                    # Static assets (images, fonts)
├── scripts/                   # Automation (paper import, email fix, etc.)
├── docs/api/                  # Generated API documentation
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── _components/       # Shared UI components
│   │   ├── api/               # API routes (tRPC, auth, uploads)
│   │   ├── auth/              # Auth pages (error, signin)
│   │   ├── companies/         # Company management
│   │   ├── contexts/          # React Context providers
│   │   ├── dashboard/         # Dashboard views
│   │   ├── invoices/          # Invoice management
│   │   ├── orders/            # Order management
│   │   ├── users/             # User management & registration
│   │   ├── workOrders/        # Work order management
│   │   ├── store/             # Page-level store providers
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Client providers wrapper
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts        # 32 tRPC routers aggregated
│   │   │   ├── trpc.ts        # tRPC context & procedures
│   │   │   └── routers/       # Individual router modules
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── db.ts              # Prisma client singleton
│   ├── services/              # External service integrations (QuickBooks)
│   ├── store/                 # Zustand stores
│   ├── styles/                # Global CSS
│   ├── trpc/                  # tRPC client setup (react.tsx)
│   ├── types/                 # TypeScript type declarations
│   └── utils/                 # Helper functions
├── next.config.js             # Turbopack, image remotes, externals
├── package.json               # v0.1.10.0, scripts, dependencies
├── .nvmrc                     # Node 24.2.0
└── start-database.sh          # Docker PostgreSQL launcher
```

## Data Model Overview

38 Prisma models organized by domain. See `prisma/schema.prisma` for full definitions. For visual data flows, see [SYSTEM_DIAGRAM.md](./SYSTEM_DIAGRAM.md).

### Core Business (Orders & Work Orders)

| Model | Purpose |
|-------|---------|
| `WorkOrder` | Estimate/quote phase. Status: Draft → Pending → Approved → Cancelled |
| `WorkOrderItem` | Line item on a work order (paper, quantity, processing) |
| `WorkOrderItemArtwork` | File attachments on work order items |
| `WorkOrderNote` | Notes/comments on a work order |
| `WorkOrderItemStock` | Paper stock tracking for work order items |
| `WorkOrderVersion` | Version history for work order changes |
| `Order` | Confirmed production order (created from WorkOrder) |
| `OrderItem` | Line item on an order with production details |
| `OrderItemArtwork` | File attachments on order items |
| `OrderNote` | Notes/comments on an order |
| `OrderItemStock` | Paper stock tracking for order items |
| `OrderPayment` | Payment records against an order |
| `OutsourcedOrderItemInfo` | Tracking info for items sent to external vendors |
| `OutsourcedOrderItemInfoFile` | File attachments for outsourced items |

### Prepress & Production

| Model | Purpose |
|-------|---------|
| `Typesetting` | Prepress design work. Status: InProgress → WaitingApproval → Completed |
| `TypesettingOption` | Design options (selected/unselected) for a typesetting job |
| `TypesettingProof` | Proof iterations with approval tracking |
| `TypesettingProofArtwork` | File attachments on proofs |
| `ProcessingOptions` | Finishing: cutting, padding, drilling, folding, numbering, stitching, binding |
| `PaperProduct` | Paper stock catalog (brand, type, finish, weight, size) |
| `ProductType` | Product category (e.g., business cards, brochures) |

### Customers & Locations

| Model | Purpose |
|-------|---------|
| `Company` | Parent organization. Synced with QuickBooks |
| `Office` | Customer branch/location under a Company |
| `Address` | Physical addresses for offices (billing, shipping, etc.) |
| `WalkInCustomer` | Ad-hoc customers without Company/Office records |
| `UsersOnOffices` | Many-to-many: users assigned to offices |

### Billing & Shipping

| Model | Purpose |
|-------|---------|
| `Invoice` | Bill generated from an order. Synced to QuickBooks |
| `InvoiceItem` | Line items on an invoice |
| `InvoicePayment` | Payments against an invoice |
| `ShippingInfo` | Shipping method, carrier, tracking, cost |
| `ShippingPickup` | Pickup scheduling details |

### Auth & System

| Model | Purpose |
|-------|---------|
| `User` | User accounts. Stores QB OAuth tokens |
| `Account` | OAuth provider accounts (NextAuth) |
| `Session` | Active sessions (NextAuth) |
| `VerificationToken` | Email verification tokens (NextAuth) |
| `Role` | Named roles (Admin, Sales, Prepress, Bindery, etc.) |
| `Permission` | Granular permissions (CRUD per entity) |
| `Post` | Legacy/scaffold model (T3 starter) |

### Enums (22)

`AddressType`, `BindingType`, `FileType`, `InvoicePrintEmailOptions`, `InvoiceStatus`, `OrderStatus`, `OrderItemStatus`, `PaperBrand`, `PaperType`, `PaperFinish`, `PaymentMethod`, `PaymentStatus`, `PermissionName`, `ProofMethod`, `RoleName`, `ShippingMethod`, `ShippingType`, `StaticRoles`, `StockStatus`, `TypesettingStatus`, `WorkOrderItemStatus`, `WorkOrderStatus`

## tRPC Routers (32)

| Router Key | Module Path | Domain |
|-----------|-------------|--------|
| `addresses` | `shared/address` | Locations |
| `companies` | `companies/company` | Customers |
| `contacts` | `contacts/contact` | Customers |
| `invoices` | `invoices/invoice` | Billing |
| `offices` | `offices/office` | Customers |
| `orders` | `orders/order` | Orders |
| `orderItems` | `orderItems/orderItem` | Orders |
| `orderItemStocks` | `orderItemStocks/orderItemStock` | Orders |
| `orderNotes` | `orders/orderNotes` | Orders |
| `orderPayments` | `orderPayments/orderPayment` | Billing |
| `paperProducts` | `shared/paperProducts/paperProducts` | Production |
| `post` | `post` | System |
| `processingOptions` | `shared/processingOptions` | Production |
| `productTypes` | `shared/productTypes/productType` | Production |
| `qbAuth` | `quickbooks/qbAuth` | QuickBooks |
| `qbCompany` | `quickbooks/qbCompany` | QuickBooks |
| `qbCustomers` | `quickbooks/qbCustomer` | QuickBooks |
| `qbInvoices` | `quickbooks/qbInvoice` | QuickBooks |
| `qbSyncCustomers` | `quickbooks/qbSyncCustomer` | QuickBooks |
| `roles` | `roles/roles` | Auth |
| `shippingInfo` | `shared/shippingInfo` | Shipping |
| `shippingPickups` | `shared/shippingPickup` | Shipping |
| `typesettings` | `shared/typesetting/typesetting` | Prepress |
| `typesettingOptions` | `shared/typesetting/typesettingOptions` | Prepress |
| `typesettingProofs` | `shared/typesetting/typesettingProofs` | Prepress |
| `userManagement` | `userManagement/userManagement` | Auth |
| `users` | `user` | Auth |
| `walkInCustomers` | `walkInCustomers/walkInCustomer` | Customers |
| `workOrders` | `workOrders/workOrder` | Work Orders |
| `workOrderItems` | `workOrderItems/workOrderItem` | Work Orders |
| `workOrderItemStocks` | `workOrderItemStocks/workOrderItemStock` | Work Orders |
| `workOrderNotes` | `workOrders/workOrderNote` | Work Orders |

## Auth & RBAC Architecture

**Provider stack** (defined in `src/server/auth.ts`):
1. **Google OAuth** — primary SSO for internal staff
2. **Email/Magic Link** — SendGrid SMTP, sends branded verification emails
3. **Credentials** — email/password with bcrypt, fallback for non-SSO users

**Strategy:** JWT (not database sessions for active auth — Session model used by NextAuth adapter)

**Session enrichment:** The JWT callback stores `user.id` in the token. The session callback fetches the user's Roles and Permissions from the database on every request, ensuring RBAC is always current.

**Roles** (9): Admin, Bindery, Customer, Finance, Manager, Prepress, Production, Sales, User

**Permissions** (45 defined in `PermissionName` enum): CRUD operations scoped per entity (e.g., `CreateOrder`, `UpdateWorkOrder`, `InvoiceRead`).

**RBAC flow:** User → Roles (many-to-many) → Permissions (many-to-many per role) → checked in tRPC middleware/procedures.

## State Management

| Tool | Usage |
|------|-------|
| **Zustand** (`src/store/`) | Global client state (cart, UI preferences) |
| **Jotai** | Atomic state for component-local shared state |
| **React Context** (`src/app/contexts/`) | Feature-scoped providers (e.g., order editing context) |
| **tRPC/React Query** | Server state cache and synchronization |

## Third-Party Integrations

| Service | Purpose | Config Location |
|---------|---------|----------------|
| QuickBooks Online | Customer/invoice sync | `src/services/quickbooksService.ts`, QB routers |
| SendGrid | Transactional email (magic links, order notifications) | `src/server/auth.ts`, env vars |
| Pusher | Real-time updates | Client env vars (`NEXT_PUBLIC_PUSHER_*`) |
| Honeybadger | Error monitoring & alerting | `HONEYBADGER_API_KEY` env var |
| OpenAI | AI features | `OPENAI_API_KEY` env var |
| Google OAuth | SSO authentication | `GOOGLE_CLIENT_*` env vars |

## See Also

- [SYSTEM_DIAGRAM.md](./SYSTEM_DIAGRAM.md) — visual component and data flow diagrams
- [REQUEST_FLOW.md](./REQUEST_FLOW.md) — detailed request lifecycle
- [DEV_SETUP.md](./DEV_SETUP.md) — development environment setup
