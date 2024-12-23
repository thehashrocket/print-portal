# API Documentation

This documentation covers all the tRPC API endpoints available in the application.

## Available Routers

- [Companies - Company](./companies/company.md)
- [Contacts - Contact](./contacts/contact.md)
- [Invoices - Invoice](./invoices/invoice.md)
- [Offices - Office](./offices/office.md)
- [Order Item Stocks - Order Item Stock](./orderItemStocks/orderItemStock.md)
- [Order Items - Order Item](./orderItems/orderItem.md)
- [Order Payments - Order Payment](./orderPayments/orderPayment.md)
- [Orders - Order Notes](./orders/orderNotes.md)
- [Orders - Order](./orders/order.md)
- [Post](./post.md)
- [Quickbooks - Qb Auth](./quickbooks/qbAuth.md)
- [Quickbooks - Qb Company](./quickbooks/qbCompany.md)
- [Quickbooks - Qb Customer](./quickbooks/qbCustomer.md)
- [Quickbooks - Qb Invoice](./quickbooks/qbInvoice.md)
- [Quickbooks - Qb Sync Customer](./quickbooks/qbSyncCustomer.md)
- [Roles - Roles](./roles/roles.md)
- [Shared - Address](./shared/address.md)
- [Shared - Processing Options](./shared/processingOptions.md)
- [Shared - Shipping Info](./shared/shippingInfo.md)
- [Shared - Shipping Pickup](./shared/shippingPickup.md)
- [Shared - Typesetting - Typesetting Options](./shared/typesetting/typesettingOptions.md)
- [Shared - Typesetting - Typesetting Proofs](./shared/typesetting/typesettingProofs.md)
- [Shared - Typesetting - Typesetting](./shared/typesetting/typesetting.md)
- [User Management - User Management](./userManagement/userManagement.md)
- [User](./user.md)
- [Work Order Item Stocks - Work Order Item Stock](./workOrderItemStocks/workOrderItemStock.md)
- [Work Order Items - Work Order Item](./workOrderItems/workOrderItem.md)
- [Work Orders - Work Order Note](./workOrders/workOrderNote.md)
- [Work Orders - Work Order](./workOrders/workOrder.md)

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
