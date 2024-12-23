# Quickbooks/qb Invoice Router

This documentation describes all the available endpoints in the Quickbooks/qb Invoice router.

## Overview

The Quickbooks/qb Invoice router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `createQbInvoiceFromInvoice` | mutation | Updates create qb invoice from invoice |
| `createQbInvoiceFromOrder` | mutation | Updates create qb invoice from order |
| `getInvoicePdf` | mutation | Updates get invoice pdf |
| `sendInvoiceEmail` | mutation | Updates send invoice email |
| `syncInvoice` | mutation | Updates sync invoice |
| `syncInvoices` | query | Retrieves sync invoices |
| `syncInvoicesForOffice` | mutation | Updates sync invoices for office |
| `createQbInvoiceFromInvoice` | mutation | Updates create qb invoice from invoice |
| `createQbInvoiceFromOrder` | mutation | Updates create qb invoice from order |
| `getInvoicePdf` | mutation | Updates get invoice pdf |
| `sendInvoiceEmail` | mutation | Updates send invoice email |
| `syncInvoice` | mutation | Updates sync invoice |
| `syncInvoices` | query | Retrieves sync invoices |
| `syncInvoicesForOffice` | mutation | Updates sync invoices for office |

### `createQbInvoiceFromInvoice`

**Type:** `mutation`

Updates create qb invoice from invoice

**Input:**
```typescript
z.object({
  invoiceId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createQbInvoiceFromInvoice.useMutation();
```

### `createQbInvoiceFromOrder`

**Type:** `mutation`

Updates create qb invoice from order

**Input:**
```typescript
z.object({
  orderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createQbInvoiceFromOrder.useMutation();
```

### `getInvoicePdf`

**Type:** `mutation`

Updates get invoice pdf

**Input:**
```typescript
z.object({
  quickbooksId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getInvoicePdf.useMutation();
```

### `sendInvoiceEmail`

**Type:** `mutation`

Updates send invoice email

**Input:**
```typescript
z.object({
  quickbooksId: z.string(),
  recipientEmail: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.sendInvoiceEmail.useMutation();
```

### `syncInvoice`

**Type:** `mutation`

Updates sync invoice

**Input:**
```typescript
z.object({
  orderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncInvoice.useMutation();
```

### `syncInvoices`

**Type:** `query`

Retrieves sync invoices

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.syncInvoices.query({});
```

### `syncInvoicesForOffice`

**Type:** `mutation`

Updates sync invoices for office

**Input:**
```typescript
z.object({
  officeId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncInvoicesForOffice.useMutation();
```

### `createQbInvoiceFromInvoice`

**Type:** `mutation`

Updates create qb invoice from invoice

**Input:**
```typescript
z.object({
  invoiceId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createQbInvoiceFromInvoice.useMutation();
```

### `createQbInvoiceFromOrder`

**Type:** `mutation`

Updates create qb invoice from order

**Input:**
```typescript
z.object({
  orderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createQbInvoiceFromOrder.useMutation();
```

### `getInvoicePdf`

**Type:** `mutation`

Updates get invoice pdf

**Input:**
```typescript
z.object({
  quickbooksId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getInvoicePdf.useMutation();
```

### `sendInvoiceEmail`

**Type:** `mutation`

Updates send invoice email

**Input:**
```typescript
z.object({
  quickbooksId: z.string(),
  recipientEmail: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.sendInvoiceEmail.useMutation();
```

### `syncInvoice`

**Type:** `mutation`

Updates sync invoice

**Input:**
```typescript
z.object({
  orderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncInvoice.useMutation();
```

### `syncInvoices`

**Type:** `query`

Retrieves sync invoices

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.syncInvoices.query({});
```

### `syncInvoicesForOffice`

**Type:** `mutation`

Updates sync invoices for office

**Input:**
```typescript
z.object({
  officeId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncInvoicesForOffice.useMutation();
```

## Error Handling

All endpoints in this router follow standard error handling practices:

- `400` - Bad Request - Invalid input parameters
- `401` - Unauthorized - Authentication required
- `403` - Forbidden - Insufficient permissions
- `404` - Not Found - Resource doesn't exist
- `500` - Internal Server Error - Something went wrong on the server

For detailed error handling, wrap your calls in try/catch blocks:

```typescript
try {
  const result = await trpc.someEndpoint.query(/* ... */);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // Handle not found error
  }
  // Handle other errors
}
```