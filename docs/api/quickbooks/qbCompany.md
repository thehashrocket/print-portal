# Quickbooks/qb Company Router

This documentation describes all the available endpoints in the Quickbooks/qb Company router.

## Overview

The Quickbooks/qb Company router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getCompanyInfo` | query | Retrieves get company info |
| `getCompanyInfo` | query | Retrieves get company info |

### `getCompanyInfo`

**Type:** `query`

Retrieves get company info

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCompanyInfo.query({});
```

### `getCompanyInfo`

**Type:** `query`

Retrieves get company info

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCompanyInfo.query({});
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