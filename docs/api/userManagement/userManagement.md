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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getAllUsers.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getAllUsers.query({});
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getUserById.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getUserById.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.deleteUser.useMutation({
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

const mutation = api.deleteUser.useMutation({
  onMutate: async (newData) => {
    await utils.deleteUser.cancel();
    const previousData = utils.deleteUser.getData();

    utils.deleteUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.deleteUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.deleteUser.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateUser.useMutation({
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
  name: z.string(),
  email: z.string(),
  roleIds: z.array(),
  officeIds: z.array()
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

const mutation = api.updateUser.useMutation({
  onMutate: async (newData) => {
    await utils.updateUser.cancel();
    const previousData = utils.updateUser.getData();

    utils.updateUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateUser.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateUserRoles.useMutation({
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
  userId: z.string(),
  roleNames: z.array()
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

const mutation = api.updateUserRoles.useMutation({
  onMutate: async (newData) => {
    await utils.updateUserRoles.cancel();
    const previousData = utils.updateUserRoles.getData();

    utils.updateUserRoles.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateUserRoles.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateUserRoles.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.createUser.useMutation({
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
  name: z.string(),
  email: unknown,
  companyId: z.string(),
  officeId: z.string()
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

const mutation = api.createUser.useMutation({
  onMutate: async (newData) => {
    await utils.createUser.cancel();
    const previousData = utils.createUser.getData();

    utils.createUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createUser.invalidate();
  },
});
```

### `getAllUsers`

**Type:** `query`

Retrieves get all users

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
  const { data, isLoading } = api.getAllUsers.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getAllUsers.query({});
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getUserById.useQuery("example");

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getUserById.query("example");
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.deleteUser.useMutation({
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

const mutation = api.deleteUser.useMutation({
  onMutate: async (newData) => {
    await utils.deleteUser.cancel();
    const previousData = utils.deleteUser.getData();

    utils.deleteUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.deleteUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.deleteUser.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateUser.useMutation({
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
  name: z.string(),
  email: z.string(),
  roleIds: z.array(),
  officeIds: z.array()
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

const mutation = api.updateUser.useMutation({
  onMutate: async (newData) => {
    await utils.updateUser.cancel();
    const previousData = utils.updateUser.getData();

    utils.updateUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateUser.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateUserRoles.useMutation({
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
  userId: z.string(),
  roleNames: z.array()
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

const mutation = api.updateUserRoles.useMutation({
  onMutate: async (newData) => {
    await utils.updateUserRoles.cancel();
    const previousData = utils.updateUserRoles.getData();

    utils.updateUserRoles.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateUserRoles.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateUserRoles.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.createUser.useMutation({
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
  name: z.string(),
  email: unknown,
  companyId: z.string(),
  officeId: z.string()
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

const mutation = api.createUser.useMutation({
  onMutate: async (newData) => {
    await utils.createUser.cancel();
    const previousData = utils.createUser.getData();

    utils.createUser.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createUser.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createUser.invalidate();
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