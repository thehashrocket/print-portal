# Quickbooks/qb Auth Router

This documentation describes all the available endpoints in the Quickbooks/qb Auth router.

## Overview

The Quickbooks/qb Auth router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `checkQuickbooksAuthStatus` | query | Retrieves check quickbooks auth status |
| `getAccessToken` | mutation | Updates get access token |
| `getIntuitSignInUrl` | mutation | Updates get intuit sign in url |
| `getUserInfo` | mutation | Updates get user info |
| `handleCallback` | mutation | Updates handle callback |
| `initializeAuth` | mutation | Updates initialize auth |
| `refreshToken` | mutation | Updates refresh token |
| `revokeToken` | mutation | Updates revoke token |
| `checkQuickbooksAuthStatus` | query | Retrieves check quickbooks auth status |
| `getAccessToken` | mutation | Updates get access token |
| `getIntuitSignInUrl` | mutation | Updates get intuit sign in url |
| `getUserInfo` | mutation | Updates get user info |
| `handleCallback` | mutation | Updates handle callback |
| `initializeAuth` | mutation | Updates initialize auth |
| `refreshToken` | mutation | Updates refresh token |
| `revokeToken` | mutation | Updates revoke token |

### `checkQuickbooksAuthStatus`

**Type:** `query`

Retrieves check quickbooks auth status

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.checkQuickbooksAuthStatus.query({});
```

### `getAccessToken`

**Type:** `mutation`

Updates get access token

**Input:**
```typescript
z.object({
  code: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getAccessToken.useMutation();
```

### `getIntuitSignInUrl`

**Type:** `mutation`

Updates get intuit sign in url

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getIntuitSignInUrl.useMutation();
```

### `getUserInfo`

**Type:** `mutation`

Updates get user info

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getUserInfo.useMutation();
```

### `handleCallback`

**Type:** `mutation`

Updates handle callback

**Input:**
```typescript
z.object({
  code: z.string(),
  realmId: z.string(),
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
const mutation = trpc.handleCallback.useMutation();
```

### `initializeAuth`

**Type:** `mutation`

Updates initialize auth

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.initializeAuth.useMutation();
```

### `refreshToken`

**Type:** `mutation`

Updates refresh token

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.refreshToken.useMutation();
```

### `revokeToken`

**Type:** `mutation`

Updates revoke token

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.revokeToken.useMutation();
```

### `checkQuickbooksAuthStatus`

**Type:** `query`

Retrieves check quickbooks auth status

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.checkQuickbooksAuthStatus.query({});
```

### `getAccessToken`

**Type:** `mutation`

Updates get access token

**Input:**
```typescript
z.object({
  code: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getAccessToken.useMutation();
```

### `getIntuitSignInUrl`

**Type:** `mutation`

Updates get intuit sign in url

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getIntuitSignInUrl.useMutation();
```

### `getUserInfo`

**Type:** `mutation`

Updates get user info

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.getUserInfo.useMutation();
```

### `handleCallback`

**Type:** `mutation`

Updates handle callback

**Input:**
```typescript
z.object({
  code: z.string(),
  realmId: z.string(),
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
const mutation = trpc.handleCallback.useMutation();
```

### `initializeAuth`

**Type:** `mutation`

Updates initialize auth

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.initializeAuth.useMutation();
```

### `refreshToken`

**Type:** `mutation`

Updates refresh token

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.refreshToken.useMutation();
```

### `revokeToken`

**Type:** `mutation`

Updates revoke token

**Input:** None required

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.revokeToken.useMutation();
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