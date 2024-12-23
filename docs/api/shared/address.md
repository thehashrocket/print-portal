# Shared/address Router

This documentation describes all the available endpoints in the Shared/address router.

## Overview

The Shared/address router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getByOfficeId` | query | Retrieves get by office id |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | query | Retrieves update |
| `delete` | query | Retrieves delete |
| `getByID` | query | Retrieves get by i d |
| `getByOfficeId` | query | Retrieves get by office id |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | query | Retrieves update |
| `delete` | query | Retrieves delete |

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
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string(),
  addressType: z.nativeEnum()
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

**Type:** `query`

Retrieves update

**Input:**
```typescript
z.object({
  id: z.string(),
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: z.string(),
  zipCode: z.string(),
  state: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.update.query(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: "example",
  zipCode: "example",
  state: "example"
}));
```

### `delete`

**Type:** `query`

Retrieves delete

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
const result = await trpc.delete.query("example");
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
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string(),
  addressType: z.nativeEnum()
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

**Type:** `query`

Retrieves update

**Input:**
```typescript
z.object({
  id: z.string(),
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: z.string(),
  zipCode: z.string(),
  state: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.update.query(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  officeId: "example",
  zipCode: "example",
  state: "example"
}));
```

### `delete`

**Type:** `query`

Retrieves delete

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
const result = await trpc.delete.query("example");
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