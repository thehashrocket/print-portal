# Post Router

This documentation describes all the available endpoints in the Post router.

## Overview

The Post router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `hello` | query | Retrieves hello |
| `create` | mutation | Updates create |
| `getLatest` | query | Retrieves get latest |
| `getSecretMessage` | query | Retrieves get secret message |
| `hello` | query | Retrieves hello |
| `create` | mutation | Updates create |
| `getLatest` | query | Retrieves get latest |
| `getSecretMessage` | query | Retrieves get secret message |

### `hello`

**Type:** `query`

Retrieves hello

**Input:**
```typescript
z.object({
  text: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.hello.query(z.object({
  text: "example"
}));
```

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  name: unknown
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

### `getLatest`

**Type:** `query`

Retrieves get latest

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getLatest.query({});
```

### `getSecretMessage`

**Type:** `query`

Retrieves get secret message

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getSecretMessage.query({});
```

### `hello`

**Type:** `query`

Retrieves hello

**Input:**
```typescript
z.object({
  text: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.hello.query(z.object({
  text: "example"
}));
```

### `create`

**Type:** `mutation`

Updates create

**Input:**
```typescript
z.object({
  name: unknown
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

### `getLatest`

**Type:** `query`

Retrieves get latest

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getLatest.query({});
```

### `getSecretMessage`

**Type:** `query`

Retrieves get secret message

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getSecretMessage.query({});
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