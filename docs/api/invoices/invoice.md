# Invoices/invoice Router

This documentation describes all the available endpoints in the Invoices/invoice router.

## Overview

The Invoices/invoice router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getAll` | query | Retrieves get all |
| `getById` | query | Retrieves get by id |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |
| `addPayment` | mutation | Updates add payment |
| `getAll` | query | Retrieves get all |
| `getById` | query | Retrieves get by id |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |
| `addPayment` | mutation | Updates add payment |

### `getAll`

**Type:** `query`

Retrieves get all

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAll.query({});
```

### `getById`

**Type:** `query`

Retrieves get by id

**Input:**
```typescript
z.string()
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getById.query("example");
```

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  orderId: z.string(),
  dateIssued: z.date(),
  dateDue: z.date(),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  status: z.nativeEnum(),
  notes: unknown,
  items: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.create.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  dateIssued: unknown,
  dateDue: unknown,
  subtotal: unknown,
  taxRate: unknown,
  taxAmount: unknown,
  total: unknown,
  status: unknown,
  notes: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.update.useMutation();
```

### `delete`

**Type:** `mutation`

Updates delete

**Input:**
```typescript
z.string()
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.delete.useMutation();
```

### `addPayment`

**Type:** `mutation`

Updates add payment

**Input:**
```typescript
z.object({
  invoiceId: z.string(),
  amount: z.number(),
  paymentDate: z.date(),
  paymentMethod: z.nativeEnum()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.addPayment.useMutation();
```

### `getAll`

**Type:** `query`

Retrieves get all

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAll.query({});
```

### `getById`

**Type:** `query`

Retrieves get by id

**Input:**
```typescript
z.string()
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getById.query("example");
```

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  orderId: z.string(),
  dateIssued: z.date(),
  dateDue: z.date(),
  subtotal: z.number(),
  taxRate: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  status: z.nativeEnum(),
  notes: unknown,
  items: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.create.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  dateIssued: unknown,
  dateDue: unknown,
  subtotal: unknown,
  taxRate: unknown,
  taxAmount: unknown,
  total: unknown,
  status: unknown,
  notes: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.update.useMutation();
```

### `delete`

**Type:** `mutation`

Updates delete

**Input:**
```typescript
z.string()
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.delete.useMutation();
```

### `addPayment`

**Type:** `mutation`

Updates add payment

**Input:**
```typescript
z.object({
  invoiceId: z.string(),
  amount: z.number(),
  paymentDate: z.date(),
  paymentMethod: z.nativeEnum()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.addPayment.useMutation();
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