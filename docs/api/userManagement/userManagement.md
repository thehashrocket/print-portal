# User Management/user Management Router

This documentation describes all the available endpoints in the User Management/user Management router.

## Overview

The User Management/user Management router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getAllUsers` | query | Retrieves get all users |
| `getUserById` | query | Retrieves get user by id |
| `deleteUser` | mutation | Updates delete user |
| `updateUser` | mutation | Updates update user |
| `updateUserRoles` | mutation | Updates update user roles |
| `createUser` | mutation | Updates create user |
| `getAllUsers` | query | Retrieves get all users |
| `getUserById` | query | Retrieves get user by id |
| `deleteUser` | mutation | Updates delete user |
| `updateUser` | mutation | Updates update user |
| `updateUserRoles` | mutation | Updates update user roles |
| `createUser` | mutation | Updates create user |

### `getAllUsers`

**Type:** `query`

Retrieves get all users

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAllUsers.query({});
```

### `getUserById`

**Type:** `query`

Retrieves get user by id

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
const result = await trpc.getUserById.query("example");
```

### `deleteUser`

**Type:** `mutation`

Updates delete user

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
const mutation = trpc.deleteUser.useMutation();
```

### `updateUser`

**Type:** `mutation`

Updates update user

**Input:**
```typescript
z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  roleIds: z.array(),
  officeIds: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateUser.useMutation();
```

### `updateUserRoles`

**Type:** `mutation`

Updates update user roles

**Input:**
```typescript
z.object({
  userId: z.string(),
  roleNames: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateUserRoles.useMutation();
```

### `createUser`

**Type:** `mutation`

Updates create user

**Input:**
```typescript
z.object({
  name: z.string(),
  email: unknown,
  companyId: z.string(),
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
const mutation = trpc.createUser.useMutation();
```

### `getAllUsers`

**Type:** `query`

Retrieves get all users

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getAllUsers.query({});
```

### `getUserById`

**Type:** `query`

Retrieves get user by id

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
const result = await trpc.getUserById.query("example");
```

### `deleteUser`

**Type:** `mutation`

Updates delete user

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
const mutation = trpc.deleteUser.useMutation();
```

### `updateUser`

**Type:** `mutation`

Updates update user

**Input:**
```typescript
z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  roleIds: z.array(),
  officeIds: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateUser.useMutation();
```

### `updateUserRoles`

**Type:** `mutation`

Updates update user roles

**Input:**
```typescript
z.object({
  userId: z.string(),
  roleNames: z.array()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateUserRoles.useMutation();
```

### `createUser`

**Type:** `mutation`

Updates create user

**Input:**
```typescript
z.object({
  name: z.string(),
  email: unknown,
  companyId: z.string(),
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
const mutation = trpc.createUser.useMutation();
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