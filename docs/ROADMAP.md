# Roadmap — Thomson Print Portal

## Vision

Thomson Print Portal serves two audiences:

1. **Internal reps** (current) — full access to order management, work orders, invoicing, QuickBooks sync, and customer management
2. **External customers** (planned) — self-service order status, notifications, shipment tracking, and proof approvals

The portal aims to digitize Thomson Printing's entire workflow from quote to payment, replacing manual processes and paper-based tracking.

## Current State

- Production system with active paying customers
- Full work order → order → invoice lifecycle
- QuickBooks Online integration for customer and invoice sync
- RBAC with 9 roles and 45 permissions
- AG Grid-based data views for orders, work orders, invoices
- Paper product catalog management
- Typesetting/proofing workflow
- Shipping tracking with multiple carriers
- Walk-in customer support
- Magic link + Google SSO + credentials authentication
- Real-time notifications via Pusher
- PDF generation for invoices/documents

## Planned Features (Prioritized)

### High Priority
- **Customer-facing portal** — read-only order status, proof approvals, shipment tracking for external customers
- **Test infrastructure** — unit and integration test framework (Vitest or similar)
- **Automated QB sync** — scheduled sync instead of manual triggers

### Medium Priority
- **Order notifications** — email/push notifications for status changes (partially implemented via SendGrid templates)
- **Reporting dashboard** — production throughput, revenue, outstanding invoices
- **Bulk operations** — batch status updates, bulk invoicing
- **Advanced search** — full-text search across orders, companies, items

### Lower Priority
- **Mobile optimization** — responsive design improvements for shop floor use
- **Audit trail** — comprehensive change logging for compliance
- **API for external integrations** — REST/GraphQL API for third-party systems
- **Document management** — centralized file storage with versioning

## Not Planned

- **Multi-tenant SaaS** — this is a single-company internal tool, not a platform
- **E-commerce/online ordering** — customers order via reps, not self-service checkout
- **Accounting beyond QB** — QuickBooks is the system of record for financials
- **Print production automation** — the portal manages workflow, not press control systems

## See Also

- [TODOS.md](../TODOS.md) — technical debt and deferred work items
- [AI_CONTEXT.md](./AI_CONTEXT.md) — project overview and domain context
