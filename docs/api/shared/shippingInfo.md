# Shared/shipping Info Router

This documentation describes all the available endpoints in the Shared/shipping Info router.

## Overview

The Shared/shipping Info router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getById` | query | Retrieves get by id |
| `getByOfficeId` | query | Retrieves get by office id |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |
| `getById` | query | Retrieves get by id |
| `getByOfficeId` | query | Retrieves get by office id |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |

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

### `getByOfficeId`

**Type:** `query`

Retrieves get by office id

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
const result = await trpc.getByOfficeId.query("example");
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

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  addressId: unknown,
  instructions: unknown,
  officeId: z.string(),
  shippingCost: unknown,
  shippingDate: unknown,
  shippingMethod: z.nativeEnum(),
  shippingNotes: unknown,
  shippingOther: unknown,
  shipToSameAsBillTo: unknown,
  shippingPickup: unknown
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
  instructions: unknown,
  shippingOther: unknown,
  shippingDate: unknown,
  shippingMethod: z.nativeEnum(),
  shippingCost: unknown,
  shipToSameAsBillTo: unknown,
  addressId: unknown,
  shippingPickup: unknown
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

### `getByOfficeId`

**Type:** `query`

Retrieves get by office id

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
const result = await trpc.getByOfficeId.query("example");
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

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  addressId: unknown,
  instructions: unknown,
  officeId: z.string(),
  shippingCost: unknown,
  shippingDate: unknown,
  shippingMethod: z.nativeEnum(),
  shippingNotes: unknown,
  shippingOther: unknown,
  shipToSameAsBillTo: unknown,
  shippingPickup: unknown
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
  instructions: unknown,
  shippingOther: unknown,
  shippingDate: unknown,
  shippingMethod: z.nativeEnum(),
  shippingCost: unknown,
  shipToSameAsBillTo: unknown,
  addressId: unknown,
  shippingPickup: unknown
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