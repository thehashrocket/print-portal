# Shared/paper Products/paper Products Router

This documentation describes all the available endpoints in the Shared/paper Products/paper Products router.

## Overview

The Shared/paper Products/paper Products router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getAll` | query | Retrieves get all |
| `getAll` | query | Retrieves get all |

### `getAll`

**Type:** `query`

Retrieves get all

**Input:** None required

**Returns:**
```typescript
unknown
```

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getAll.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getAll.query({});
  
  return <div>{/* Use your data here */}</div>;
}
```

### `getAll`

**Type:** `query`

Retrieves get all

**Input:** None required

**Returns:**
```typescript
unknown
```

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getAll.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getAll.query({});
  
  return <div>{/* Use your data here */}</div>;
}
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