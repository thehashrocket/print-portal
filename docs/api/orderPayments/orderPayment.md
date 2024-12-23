# Order Payments/order Payment Router

This documentation describes all the available endpoints in the Order Payments/order Payment router.

## Overview

The Order Payments/order Payment router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `create` | mutation | Updates create |
| `getByOrderId` | query | Retrieves get by order id |
| `create` | mutation | Updates create |
| `getByOrderId` | query | Retrieves get by order id |

### `create`

**Type:** `mutation`

Updates create

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
const mutation = trpc.create.useMutation();
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

### `create`

**Type:** `mutation`

Updates create

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
const mutation = trpc.create.useMutation();
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