# AI Context — Thomson Print Portal

## What This Project Is

Thomson Print Portal is an internal print management system for **Thomson Printing, Inc.**, a commercial printing company based in St. Charles, MO operating since 1905. The portal manages the full lifecycle of print jobs — from work order creation through typesetting, proofing, production, shipping, and invoicing.

**Primary users:** Thomson Printing internal sales reps, prepress operators, bindery staff, production managers, and finance personnel. Each role has scoped permissions via RBAC.

**Production URL:** `print-portal.thomsonprinting.com`

## Domain Terminology

| Term | Definition |
|------|-----------|
| **Work Order** | The initial estimate/quote document. Contains line items, shipping info, and customer details. Precedes the Order. |
| **Order** | A confirmed work order that enters production. Created from a Work Order. Has its own items, notes, and payment tracking. |
| **Order Item** | A single line item on an order (e.g., 500 business cards, 1000 brochures). Tracks quantity, paper, ink, processing options. |
| **Typesetting** | The prepress/design phase for an item. Tracks time, cost, and approval status. |
| **Typesetting Proof** | A proof iteration sent to the customer for approval. Tracks proof number, method (Digital/HardCopy/PDF), and approval status. |
| **Processing Options** | Finishing operations: cutting, padding, drilling, folding, numbering, stitching, binding. |
| **Paper Product** | A specific paper stock (brand, type, finish, weight, size). Referenced by order items and stock records. |
| **Stock** | Paper inventory records for an item. Tracks quantity, cost, supplier, order/receive status. |
| **Office** | A customer location (branch/office) under a Company. The billing/shipping entity on orders. |
| **Company** | A parent organization containing one or more Offices. Synced with QuickBooks as a Customer. |
| **Walk-In Customer** | An ad-hoc customer without a Company/Office record. Used for one-off jobs. |
| **Invoice** | A bill generated from an Order, synced to QuickBooks. Tracks line items, tax, payments. |
| **Shipping Info** | Shipping method, carrier, tracking numbers, pickup details for an order. |
| **QuickBooks Sync** | Bidirectional sync of customers, invoices, and payments with Intuit QuickBooks Online. |

## Key Business Concepts

### Order Lifecycle
1. **Work Order** created (Draft → Pending → Approved)
2. **Order** created from approved Work Order
3. **Order Items** added with paper, quantity, processing options
4. **Typesetting** begins (prepress designs the item)
5. **Proofs** sent to customer for approval
6. **Production** (press, bindery)
7. **Shipping** arranged and tracked
8. **Invoice** generated and synced to QuickBooks
9. **Payment** recorded

### Work Order vs Order
A **Work Order** is the estimate/quote phase. Once approved, it becomes an **Order** that enters production. Work Orders can have multiple Orders (e.g., reprints, phases). Both have their own items, but Order Items reference the production reality while Work Order Items capture the original specification.

### QuickBooks Integration
Companies/Offices sync as QuickBooks Customers. Invoices sync bidirectionally. Each synced entity stores a `quickbooksId` and `syncToken` for conflict detection. OAuth tokens are stored on the User model.

## Tech Stack Summary

- **Framework:** Next.js 16.1.3 (App Router, Turbopack)
- **Language:** TypeScript 5.9.x
- **API:** tRPC 11.x with SuperJSON serialization
- **Database:** PostgreSQL via Prisma 6.19 ORM (38 models, 22 enums)
- **Auth:** NextAuth 4.x (Google, Email/Magic Link, Credentials) with JWT strategy
- **UI:** Tailwind CSS 4.x, shadcn/ui (Radix primitives), DaisyUI, Lucide icons
- **State:** Zustand, Jotai, React Context
- **Grids/Charts:** AG Grid, AG Charts, Recharts
- **Email:** SendGrid (SMTP via Nodemailer)
- **Monitoring:** Honeybadger
- **Real-time:** Pusher
- **PDF:** jsPDF
- **Integrations:** QuickBooks Online (intuit-oauth)

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — detailed technical architecture
- [ROADMAP.md](./ROADMAP.md) — planned features and vision
- [AGENT_RULES.md](./AGENT_RULES.md) — AI agent behavioral rules
