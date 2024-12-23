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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.createCustomer.useMutation({
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

const mutation = api.createCustomer.useMutation({
  onMutate: async (newData) => {
    await utils.createCustomer.cancel();
    const previousData = utils.createCustomer.getData();

    utils.createCustomer.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createCustomer.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createCustomer.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateCustomer.useMutation({
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

const mutation = api.updateCustomer.useMutation({
  onMutate: async (newData) => {
    await utils.updateCustomer.cancel();
    const previousData = utils.updateCustomer.getData();

    utils.updateCustomer.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateCustomer.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateCustomer.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getCustomer.useQuery(z.object({

}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getCustomer.query(z.object({

}));
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.syncOffice.useMutation({
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

const mutation = api.syncOffice.useMutation({
  onMutate: async (newData) => {
    await utils.syncOffice.cancel();
    const previousData = utils.syncOffice.getData();

    utils.syncOffice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncOffice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncOffice.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.syncCompany.useMutation({
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
  companyId: z.string()
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

const mutation = api.syncCompany.useMutation({
  onMutate: async (newData) => {
    await utils.syncCompany.cancel();
    const previousData = utils.syncCompany.getData();

    utils.syncCompany.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncCompany.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncCompany.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.createCustomer.useMutation({
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

const mutation = api.createCustomer.useMutation({
  onMutate: async (newData) => {
    await utils.createCustomer.cancel();
    const previousData = utils.createCustomer.getData();

    utils.createCustomer.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createCustomer.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createCustomer.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.updateCustomer.useMutation({
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

const mutation = api.updateCustomer.useMutation({
  onMutate: async (newData) => {
    await utils.updateCustomer.cancel();
    const previousData = utils.updateCustomer.getData();

    utils.updateCustomer.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateCustomer.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateCustomer.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.getCustomer.useQuery(z.object({

}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getCustomer.query(z.object({

}));
  
  return <div>{/* Use your data here */}</div>;
}
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.syncOffice.useMutation({
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

const mutation = api.syncOffice.useMutation({
  onMutate: async (newData) => {
    await utils.syncOffice.cancel();
    const previousData = utils.syncOffice.getData();

    utils.syncOffice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncOffice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncOffice.invalidate();
  },
});
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

**Usage Examples:**


#### Client Component
```typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.syncCompany.useMutation({
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
  companyId: z.string()
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

const mutation = api.syncCompany.useMutation({
  onMutate: async (newData) => {
    await utils.syncCompany.cancel();
    const previousData = utils.syncCompany.getData();

    utils.syncCompany.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncCompany.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncCompany.invalidate();
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