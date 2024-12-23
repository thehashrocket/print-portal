# Orders/order Router

This documentation describes all the available endpoints in the Orders/order router.

## Overview

The Orders/order router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `updateDeposit` | mutation | Updates update deposit |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `updateStatus` | mutation | Updates update status |
| `dashboard` | query | Retrieves dashboard |
| `sendOrderEmail` | mutation | Updates send order email |
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `updateDeposit` | mutation | Updates update deposit |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `updateStatus` | mutation | Updates update status |
| `dashboard` | query | Retrieves dashboard |
| `sendOrderEmail` | mutation | Updates send order email |

### `getByID`

**Type:** `query`

Retrieves get by i d

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
const result = await trpc.getByID.query("example");
```

### `getAll`

**Type:** `query`

Retrieves get all

**Input:**
```typescript
unknown
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAll.query({});
```

### `updateDeposit`

**Type:** `mutation`

Updates update deposit

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  deposit: unknown
}
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateDeposit.useMutation();
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  orderId: z.string(),
  contactPersonId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateContactPerson.useMutation();
```

### `updateShippingInfo`

**Type:** `mutation`

Updates update shipping info

**Input:**
```typescript
z.object({
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
}
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateShippingInfo.useMutation();
```

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateStatus.useMutation();
```

### `dashboard`

**Type:** `query`

Retrieves dashboard

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.dashboard.query({});
```

### `sendOrderEmail`

**Type:** `mutation`

Updates send order email

**Input:**
```typescript
z.object({
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.sendOrderEmail.useMutation();
```

### `getByID`

**Type:** `query`

Retrieves get by i d

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
const result = await trpc.getByID.query("example");
```

### `getAll`

**Type:** `query`

Retrieves get all

**Input:**
```typescript
unknown
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAll.query({});
```

### `updateDeposit`

**Type:** `mutation`

Updates update deposit

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  deposit: unknown
}
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateDeposit.useMutation();
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  orderId: z.string(),
  contactPersonId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateContactPerson.useMutation();
```

### `updateShippingInfo`

**Type:** `mutation`

Updates update shipping info

**Input:**
```typescript
z.object({
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
}
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateShippingInfo.useMutation();
```

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateStatus.useMutation();
```

### `dashboard`

**Type:** `query`

Retrieves dashboard

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.dashboard.query({});
```

### `sendOrderEmail`

**Type:** `mutation`

Updates send order email

**Input:**
```typescript
z.object({
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.sendOrderEmail.useMutation();
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