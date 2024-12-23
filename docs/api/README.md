# API Documentation

This documentation covers all the tRPC API endpoints available in the application.

## Available Routers

- [Company](./company.md)
- [Contact](./contact.md)
- [Invoice](./invoice.md)
- [Office](./office.md)
- [Order Item Stock.tsx](./orderItemStock.tsx.md)
- [Order Item](./orderItem.md)
- [Order Payment.tsx](./orderPayment.tsx.md)
- [Order](./order.md)
- [Order Notes](./orderNotes.md)
- [Post](./post.md)
- [Qb Auth](./qbAuth.md)
- [Qb Company](./qbCompany.md)
- [Qb Customer](./qbCustomer.md)
- [Qb Invoice](./qbInvoice.md)
- [Qb Sync Customer](./qbSyncCustomer.md)
- [Roles](./roles.md)
- [Address](./address.md)
- [Processing Options](./processingOptions.md)
- [Shipping Info](./shippingInfo.md)
- [Shipping Pickup](./shippingPickup.md)
- [Typesetting](./typesetting.md)
- [Typesetting Options](./typesettingOptions.md)
- [Typesetting Proofs](./typesettingProofs.md)
- [User](./user.md)
- [User Management](./userManagement.md)
- [Work Order Item Stock.tsx](./workOrderItemStock.tsx.md)
- [Work Order Item](./workOrderItem.md)
- [Work Order](./workOrder.md)
- [Work Order Note](./workOrderNote.md)

## Getting Started

To use these endpoints, make sure you have the tRPC client properly configured in your application:

```typescript
import { createTRPCClient } from '@trpc/client';

const client = createTRPCClient({
  url: 'YOUR_API_URL',
});
```

## Authentication

Most endpoints require authentication. Include your session token in the request headers.

## Error Handling

See individual router documentation for specific error handling details.
