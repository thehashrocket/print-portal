# Work Order Items/work Order Item Router

This documentation describes all the available endpoints in the Work Order Items/work Order Item router.

## Overview

The Work Order Items/work Order Item router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `createWorkOrderItem` | mutation | Updates create work order item |
| `getByWorkOrderId` | query | Retrieves get by work order id |
| `updateArtwork` | mutation | Updates update artwork |
| `update` | mutation | Updates update |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |
| `deleteArtwork` | mutation | Updates delete artwork |
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `createWorkOrderItem` | mutation | Updates create work order item |
| `getByWorkOrderId` | query | Retrieves get by work order id |
| `updateArtwork` | mutation | Updates update artwork |
| `update` | mutation | Updates update |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |
| `deleteArtwork` | mutation | Updates delete artwork |

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

### `createWorkOrderItem`

**Type:** `mutation`

Updates create work order item

**Input:**
```typescript
z.object({
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createWorkOrderItem.useMutation();
```

### `getByWorkOrderId`

**Type:** `query`

Retrieves get by work order id

**Input:**
```typescript
z.object({
  workOrderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getByWorkOrderId.query(z.object({
  workOrderId: "example"
}));
```

### `updateArtwork`

**Type:** `mutation`

Updates update artwork

**Input:**
```typescript
z.object({
  workOrderItemId: z.string(),
  artwork: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateArtwork.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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
const mutation = trpc.update.useMutation();
```

### `updateDescription`

**Type:** `mutation`

Updates update description

**Input:**
```typescript
z.object({
  id: z.string(),
  description: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateDescription.useMutation();
```

### `updateSpecialInstructions`

**Type:** `mutation`

Updates update special instructions

**Input:**
```typescript
z.object({
  id: z.string(),
  specialInstructions: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateSpecialInstructions.useMutation();
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

### `deleteArtwork`

**Type:** `mutation`

Updates delete artwork

**Input:**
```typescript
z.object({
  artworkId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.deleteArtwork.useMutation();
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

### `createWorkOrderItem`

**Type:** `mutation`

Updates create work order item

**Input:**
```typescript
z.object({
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createWorkOrderItem.useMutation();
```

### `getByWorkOrderId`

**Type:** `query`

Retrieves get by work order id

**Input:**
```typescript
z.object({
  workOrderId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getByWorkOrderId.query(z.object({
  workOrderId: "example"
}));
```

### `updateArtwork`

**Type:** `mutation`

Updates update artwork

**Input:**
```typescript
z.object({
  workOrderItemId: z.string(),
  artwork: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateArtwork.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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
const mutation = trpc.update.useMutation();
```

### `updateDescription`

**Type:** `mutation`

Updates update description

**Input:**
```typescript
z.object({
  id: z.string(),
  description: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateDescription.useMutation();
```

### `updateSpecialInstructions`

**Type:** `mutation`

Updates update special instructions

**Input:**
```typescript
z.object({
  id: z.string(),
  specialInstructions: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateSpecialInstructions.useMutation();
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

### `deleteArtwork`

**Type:** `mutation`

Updates delete artwork

**Input:**
```typescript
z.object({
  artworkId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.deleteArtwork.useMutation();
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