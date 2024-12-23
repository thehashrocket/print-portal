# Quickbooks/qb Customer Router

This documentation describes all the available endpoints in the Quickbooks/qb Customer router.

## Overview

The Quickbooks/qb Customer router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `createCustomer` | mutation | Updates create customer |
| `updateCustomer` | mutation | Updates update customer |
| `getCustomer` | query | Retrieves get customer |
| `syncOffice` | mutation | Updates sync office |
| `syncCompany` | mutation | Updates sync company |
| `createCustomer` | mutation | Updates create customer |
| `updateCustomer` | mutation | Updates update customer |
| `getCustomer` | query | Retrieves get customer |
| `syncOffice` | mutation | Updates sync office |
| `syncCompany` | mutation | Updates sync company |

### `createCustomer`

**Type:** `mutation`

Updates create customer

**Input:**
```typescript
z.object({
  companyName: z.string(),
  officeName: z.string(),
  billAddr: {
  line1: z.string(),
  city: z.string(),
  country: z.string(),
  countrySubDivisionCode: z.string(),
  postalCode: z.string()
},
  notes: unknown,
  phone: unknown,
  email: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createCustomer.useMutation();
```

### `updateCustomer`

**Type:** `mutation`

Updates update customer

**Input:**
```typescript
z.object({
  companyId: z.string(),
  officeName: unknown,
  billAddr: {
  line1: z.string(),
  city: z.string(),
  country: z.string(),
  countrySubDivisionCode: z.string(),
  postalCode: z.string()
},
  shipAddr: unknown,
  notes: unknown,
  displayName: z.string(),
  phone: unknown,
  email: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateCustomer.useMutation();
```

### `getCustomer`

**Type:** `query`

Retrieves get customer

**Input:**
```typescript
z.object({

})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCustomer.query(z.object({

}));
```

### `syncOffice`

**Type:** `mutation`

Updates sync office

**Input:**
```typescript
z.object({
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
const mutation = trpc.syncOffice.useMutation();
```

### `syncCompany`

**Type:** `mutation`

Updates sync company

**Input:**
```typescript
z.object({
  companyId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncCompany.useMutation();
```

### `createCustomer`

**Type:** `mutation`

Updates create customer

**Input:**
```typescript
z.object({
  companyName: z.string(),
  officeName: z.string(),
  billAddr: {
  line1: z.string(),
  city: z.string(),
  country: z.string(),
  countrySubDivisionCode: z.string(),
  postalCode: z.string()
},
  notes: unknown,
  phone: unknown,
  email: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.createCustomer.useMutation();
```

### `updateCustomer`

**Type:** `mutation`

Updates update customer

**Input:**
```typescript
z.object({
  companyId: z.string(),
  officeName: unknown,
  billAddr: {
  line1: z.string(),
  city: z.string(),
  country: z.string(),
  countrySubDivisionCode: z.string(),
  postalCode: z.string()
},
  shipAddr: unknown,
  notes: unknown,
  displayName: z.string(),
  phone: unknown,
  email: unknown
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.updateCustomer.useMutation();
```

### `getCustomer`

**Type:** `query`

Retrieves get customer

**Input:**
```typescript
z.object({

})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const result = await trpc.getCustomer.query(z.object({

}));
```

### `syncOffice`

**Type:** `mutation`

Updates sync office

**Input:**
```typescript
z.object({
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
const mutation = trpc.syncOffice.useMutation();
```

### `syncCompany`

**Type:** `mutation`

Updates sync company

**Input:**
```typescript
z.object({
  companyId: z.string()
})
```

**Returns:**
```typescript
unknown
```

**Example:**
```typescript
// Using React Query hooks
const mutation = trpc.syncCompany.useMutation();
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