# Quickbooks/qb Sync Customer Router

This documentation describes all the available endpoints in the Quickbooks/qb Sync Customer router.

## Overview

The Quickbooks/qb Sync Customer router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getCustomers` | query | Retrieves get customers |
| `getCustomers` | query | Retrieves get customers |

### `getCustomers`

**Type:** `query`

Retrieves get customers

**Input:**
```typescript
z.object({
  lastSyncTime: unknown,
  pageSize: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCustomers.query(z.object({
  lastSyncTime: unknown,
  pageSize: unknown
}));
```

### `getCustomers`

**Type:** `query`

Retrieves get customers

**Input:**
```typescript
z.object({
  lastSyncTime: unknown,
  pageSize: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCustomers.query(z.object({
  lastSyncTime: unknown,
  pageSize: unknown
}));
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