# Work Orders/work Order Router

This documentation describes all the available endpoints in the Work Orders/work Order router.

## Overview

The Work Orders/work Order router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `createWorkOrder` | mutation | Updates create work order |
| `getAll` | query | Retrieves get all |
| `updateStatus` | mutation | Updates update status |
| `addShippingInfo` | mutation | Updates add shipping info |
| `convertWorkOrderToOrder` | mutation | Updates convert work order to order |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `getByID` | query | Retrieves get by i d |
| `createWorkOrder` | mutation | Updates create work order |
| `getAll` | query | Retrieves get all |
| `updateStatus` | mutation | Updates update status |
| `addShippingInfo` | mutation | Updates add shipping info |
| `convertWorkOrderToOrder` | mutation | Updates convert work order to order |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |

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

### `createWorkOrder`

**Type:** `mutation`

Updates create work order

**Input:**
```typescript
z.object({
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: z.string(),
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createWorkOrder.useMutation();
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

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum()
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

### `addShippingInfo`

**Type:** `mutation`

Updates add shipping info

**Input:**
```typescript
z.object({
  id: z.string(),
  shippingInfoId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.addShippingInfo.useMutation();
```

### `convertWorkOrderToOrder`

**Type:** `mutation`

Updates convert work order to order

**Input:**
```typescript
z.object({
  id: z.string(),
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
const mutation = trpc.convertWorkOrderToOrder.useMutation();
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  workOrderId: z.string(),
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
  workOrderId: z.string(),
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

### `createWorkOrder`

**Type:** `mutation`

Updates create work order

**Input:**
```typescript
z.object({
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: z.string(),
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createWorkOrder.useMutation();
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

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum()
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

### `addShippingInfo`

**Type:** `mutation`

Updates add shipping info

**Input:**
```typescript
z.object({
  id: z.string(),
  shippingInfoId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.addShippingInfo.useMutation();
```

### `convertWorkOrderToOrder`

**Type:** `mutation`

Updates convert work order to order

**Input:**
```typescript
z.object({
  id: z.string(),
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
const mutation = trpc.convertWorkOrderToOrder.useMutation();
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  workOrderId: z.string(),
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
  workOrderId: z.string(),
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