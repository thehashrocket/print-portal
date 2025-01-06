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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByID.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByOfficeId.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByOfficeId.query("example");
  
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
  name: unknown,
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.create.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setSuccess("Operation completed successfully!");
      setError(null);
      // Optional: Reset form or perform other actions
    },
    onError: () => {
      setIsLoading(false);
      setError("An error occurred during the operation.");
      setSuccess(null);
    },
  });

  const handleSubmit = (data: z.object({
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string(),
  addressType: z.nativeEnum()
})) => {
    setIsLoading(true);
    mutation.mutate(data);
  };

  return (
    <>
      <div className="toast toast-top toast-end">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* Form implementation here */}
    </>
  );
}
```

#### With Optimistic Updates
```typescript
const utils = api.useUtils();

const mutation = api.create.useMutation({
  onMutate: async (newData) => {
    await utils.create.cancel();
    const previousData = utils.create.getData();

    utils.create.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.create.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.create.invalidate();
  },
});
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
  name: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string()
})
```

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
  const { data, isLoading } = api.update.useQuery(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: "example",
  telephoneNumber: "example",
  zipCode: "example",
  state: "example"
}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.update.query(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: "example",
  telephoneNumber: "example",
  zipCode: "example",
  state: "example"
}));
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.delete.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.delete.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByID.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByOfficeId.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByOfficeId.query("example");
  
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
  name: unknown,
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.create.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setSuccess("Operation completed successfully!");
      setError(null);
      // Optional: Reset form or perform other actions
    },
    onError: () => {
      setIsLoading(false);
      setError("An error occurred during the operation.");
      setSuccess(null);
    },
  });

  const handleSubmit = (data: z.object({
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string(),
  addressType: z.nativeEnum()
})) => {
    setIsLoading(true);
    mutation.mutate(data);
  };

  return (
    <>
      <div className="toast toast-top toast-end">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* Form implementation here */}
    </>
  );
}
```

#### With Optimistic Updates
```typescript
const utils = api.useUtils();

const mutation = api.create.useMutation({
  onMutate: async (newData) => {
    await utils.create.cancel();
    const previousData = utils.create.getData();

    utils.create.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.create.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.create.invalidate();
  },
});
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
  name: unknown,
  officeId: z.string(),
  telephoneNumber: z.string(),
  zipCode: z.string(),
  state: z.string()
})
```

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
  const { data, isLoading } = api.update.useQuery(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: "example",
  telephoneNumber: "example",
  zipCode: "example",
  state: "example"
}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.update.query(z.object({
  id: "example",
  city: "example",
  country: "example",
  line1: "example",
  line2: unknown,
  line3: unknown,
  line4: unknown,
  name: unknown,
  officeId: "example",
  telephoneNumber: "example",
  zipCode: "example",
  state: "example"
}));
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.delete.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.delete.query("example");
  
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