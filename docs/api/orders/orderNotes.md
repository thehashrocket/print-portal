# Orders/order Notes Router

This documentation describes all the available endpoints in the Orders/order Notes router.

## Overview

The Orders/order Notes router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |

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

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  note: z.string(),
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
const mutation = trpc.create.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  note: z.string()
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

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  note: z.string(),
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
const mutation = trpc.create.useMutation();
```

### `update`

**Type:** `mutation`

Updates update

**Input:**
```typescript
z.object({
  id: z.string(),
  note: z.string()
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