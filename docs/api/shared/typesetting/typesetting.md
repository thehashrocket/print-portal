# Shared/typesetting/typesetting Router

This documentation describes all the available endpoints in the Shared/typesetting/typesetting router.

## Overview

The Shared/typesetting/typesetting router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getById` | query | Retrieves get by id |
| `getByOrderItemID` | query | Retrieves get by order item i d |
| `getByWorkOrderItemID` | query | Retrieves get by work order item i d |
| `getAll` | query | Retrieves get all |
| `create` | mutation | Updates create |
| `update` | mutation | Updates update |
| `delete` | mutation | Updates delete |
| `getById` | query | Retrieves get by id |
| `getByOrderItemID` | query | Retrieves get by order item i d |
| `getByWorkOrderItemID` | query | Retrieves get by work order item i d |
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

### `getByOrderItemID`

**Type:** `query`

Retrieves get by order item i d

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
const result = await trpc.getByOrderItemID.query("example");
```

### `getByWorkOrderItemID`

**Type:** `query`

Retrieves get by work order item i d

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
const result = await trpc.getByWorkOrderItemID.query("example");
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
  approved: z.boolean(),
  cost: unknown,
  dateIn: z.date(),
  followUpNotes: unknown,
  orderItemId: unknown,
  plateRan: unknown,
  prepTime: unknown,
  status: z.nativeEnum(),
  timeIn: z.string(),
  workOrderItemId: unknown
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
  approved: z.boolean(),
  cost: unknown,
  dateIn: z.date(),
  followUpNotes: unknown,
  orderItemId: unknown,
  plateRan: unknown,
  prepTime: unknown,
  status: z.nativeEnum(),
  timeIn: z.string(),
  workOrderItemId: unknown,
  TypesettingOptions: unknown,
  TypesettingProofs: unknown
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

### `getByOrderItemID`

**Type:** `query`

Retrieves get by order item i d

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
const result = await trpc.getByOrderItemID.query("example");
```

### `getByWorkOrderItemID`

**Type:** `query`

Retrieves get by work order item i d

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
const result = await trpc.getByWorkOrderItemID.query("example");
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
  approved: z.boolean(),
  cost: unknown,
  dateIn: z.date(),
  followUpNotes: unknown,
  orderItemId: unknown,
  plateRan: unknown,
  prepTime: unknown,
  status: z.nativeEnum(),
  timeIn: z.string(),
  workOrderItemId: unknown
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
  approved: z.boolean(),
  cost: unknown,
  dateIn: z.date(),
  followUpNotes: unknown,
  orderItemId: unknown,
  plateRan: unknown,
  prepTime: unknown,
  status: z.nativeEnum(),
  timeIn: z.string(),
  workOrderItemId: unknown,
  TypesettingOptions: unknown,
  TypesettingProofs: unknown
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