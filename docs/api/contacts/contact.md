# Contacts/contact Router

This documentation describes all the available endpoints in the Contacts/contact router.

## Overview

The Contacts/contact router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `createContact` | mutation | Updates create contact |
| `getByOfficeId` | query | Retrieves get by office id |
| `createContact` | mutation | Updates create contact |
| `getByOfficeId` | query | Retrieves get by office id |

### `createContact`

**Type:** `mutation`

Updates create contact

**Input:**
```typescript
z.object({
  name: z.string(),
  email: unknown,
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
const mutation = trpc.createContact.useMutation();
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

### `createContact`

**Type:** `mutation`

Updates create contact

**Input:**
```typescript
z.object({
  name: z.string(),
  email: unknown,
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
const mutation = trpc.createContact.useMutation();
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