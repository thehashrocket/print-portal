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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getById.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getById.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByOrderItemID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByOrderItemID.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByWorkOrderItemID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByWorkOrderItemID.query("example");
  
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.update.useMutation({
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

const mutation = api.update.useMutation({
  onMutate: async (newData) => {
    await utils.update.cancel();
    const previousData = utils.update.getData();

    utils.update.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.update.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.update.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.delete.useMutation({
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

  const handleSubmit = (data: z.string()) => {
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

const mutation = api.delete.useMutation({
  onMutate: async (newData) => {
    await utils.delete.cancel();
    const previousData = utils.delete.getData();

    utils.delete.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.delete.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.delete.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getById.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getById.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByOrderItemID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByOrderItemID.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getByWorkOrderItemID.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByWorkOrderItemID.query("example");
  
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.update.useMutation({
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

const mutation = api.update.useMutation({
  onMutate: async (newData) => {
    await utils.update.cancel();
    const previousData = utils.update.getData();

    utils.update.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.update.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.update.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.delete.useMutation({
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

  const handleSubmit = (data: z.string()) => {
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

const mutation = api.delete.useMutation({
  onMutate: async (newData) => {
    await utils.delete.cancel();
    const previousData = utils.delete.getData();

    utils.delete.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.delete.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.delete.invalidate();
  },
});
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