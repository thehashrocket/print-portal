# Order Items/order Item Router

This documentation describes all the available endpoints in the Order Items/order Item router.

## Overview

The Order Items/order Item router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getByOrderId` | query | Retrieves get by order id |
| `getAll` | query | Retrieves get all |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |
| `getByID` | query | Retrieves get by i d |
| `getByOrderId` | query | Retrieves get by order id |
| `getAll` | query | Retrieves get all |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |

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

### `getByOrderId`

**Type:** `query`

Retrieves get by order id

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
const result = await trpc.getByOrderId.query("example");
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
  status: z.nativeEnum(),
  sendEmail: unknown,
  emailOverride: unknown
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

### `getByOrderId`

**Type:** `query`

Retrieves get by order id

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
const result = await trpc.getByOrderId.query("example");
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
  status: z.nativeEnum(),
  sendEmail: unknown,
  emailOverride: unknown
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