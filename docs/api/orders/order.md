# Orders/order Router

This documentation describes all the available endpoints in the Orders/order router.

## Overview

The Orders/order router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `updateDeposit` | mutation | Updates update deposit |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `updateStatus` | mutation | Updates update status |
| `dashboard` | query | Retrieves dashboard |
| `sendOrderEmail` | mutation | Updates send order email |
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `updateDeposit` | mutation | Updates update deposit |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `updateStatus` | mutation | Updates update status |
| `dashboard` | query | Retrieves dashboard |
| `sendOrderEmail` | mutation | Updates send order email |

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

### `getAll`

**Type:** `query`

Retrieves get all

**Input:**
```typescript
unknown
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

### `updateDeposit`

**Type:** `mutation`

Updates update deposit

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  deposit: unknown
}
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

  const mutation = api.updateDeposit.useMutation({
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
  data: {
  deposit: unknown
}
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

const mutation = api.updateDeposit.useMutation({
  onMutate: async (newData) => {
    await utils.updateDeposit.cancel();
    const previousData = utils.updateDeposit.getData();

    utils.updateDeposit.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateDeposit.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateDeposit.invalidate();
  },
});
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  orderId: z.string(),
  contactPersonId: z.string()
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

  const mutation = api.updateContactPerson.useMutation({
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
  orderId: z.string(),
  contactPersonId: z.string()
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

const mutation = api.updateContactPerson.useMutation({
  onMutate: async (newData) => {
    await utils.updateContactPerson.cancel();
    const previousData = utils.updateContactPerson.getData();

    utils.updateContactPerson.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateContactPerson.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateContactPerson.invalidate();
  },
});
```

### `updateShippingInfo`

**Type:** `mutation`

Updates update shipping info

**Input:**
```typescript
z.object({
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.nativeEnum(),
  shippingOther: unknown,
  trackingNumber: unknown,
  shippingPickup: unknown
}
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

  const mutation = api.updateShippingInfo.useMutation({
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
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.nativeEnum(),
  shippingOther: unknown,
  trackingNumber: unknown,
  shippingPickup: unknown
}
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

const mutation = api.updateShippingInfo.useMutation({
  onMutate: async (newData) => {
    await utils.updateShippingInfo.cancel();
    const previousData = utils.updateShippingInfo.getData();

    utils.updateShippingInfo.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateShippingInfo.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateShippingInfo.invalidate();
  },
});
```

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
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

  const mutation = api.updateStatus.useMutation({
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
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
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

const mutation = api.updateStatus.useMutation({
  onMutate: async (newData) => {
    await utils.updateStatus.cancel();
    const previousData = utils.updateStatus.getData();

    utils.updateStatus.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateStatus.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateStatus.invalidate();
  },
});
```

### `dashboard`

**Type:** `query`

Retrieves dashboard

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
  const { data, isLoading } = api.dashboard.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.dashboard.query({});
  
  return <div>{/* Use your data here */}</div>;
}
```

### `sendOrderEmail`

**Type:** `mutation`

Updates send order email

**Input:**
```typescript
z.object({
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
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

  const mutation = api.sendOrderEmail.useMutation({
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
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
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

const mutation = api.sendOrderEmail.useMutation({
  onMutate: async (newData) => {
    await utils.sendOrderEmail.cancel();
    const previousData = utils.sendOrderEmail.getData();

    utils.sendOrderEmail.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.sendOrderEmail.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.sendOrderEmail.invalidate();
  },
});
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

### `getAll`

**Type:** `query`

Retrieves get all

**Input:**
```typescript
unknown
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

### `updateDeposit`

**Type:** `mutation`

Updates update deposit

**Input:**
```typescript
z.object({
  id: z.string(),
  data: {
  deposit: unknown
}
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

  const mutation = api.updateDeposit.useMutation({
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
  data: {
  deposit: unknown
}
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

const mutation = api.updateDeposit.useMutation({
  onMutate: async (newData) => {
    await utils.updateDeposit.cancel();
    const previousData = utils.updateDeposit.getData();

    utils.updateDeposit.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateDeposit.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateDeposit.invalidate();
  },
});
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  orderId: z.string(),
  contactPersonId: z.string()
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

  const mutation = api.updateContactPerson.useMutation({
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
  orderId: z.string(),
  contactPersonId: z.string()
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

const mutation = api.updateContactPerson.useMutation({
  onMutate: async (newData) => {
    await utils.updateContactPerson.cancel();
    const previousData = utils.updateContactPerson.getData();

    utils.updateContactPerson.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateContactPerson.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateContactPerson.invalidate();
  },
});
```

### `updateShippingInfo`

**Type:** `mutation`

Updates update shipping info

**Input:**
```typescript
z.object({
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.nativeEnum(),
  shippingOther: unknown,
  trackingNumber: unknown,
  shippingPickup: unknown
}
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

  const mutation = api.updateShippingInfo.useMutation({
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
  orderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.nativeEnum(),
  shippingOther: unknown,
  trackingNumber: unknown,
  shippingPickup: unknown
}
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

const mutation = api.updateShippingInfo.useMutation({
  onMutate: async (newData) => {
    await utils.updateShippingInfo.cancel();
    const previousData = utils.updateShippingInfo.getData();

    utils.updateShippingInfo.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateShippingInfo.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateShippingInfo.invalidate();
  },
});
```

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
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

  const mutation = api.updateStatus.useMutation({
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
  status: z.nativeEnum(),
  sendEmail: z.boolean(),
  emailOverride: z.string(),
  shippingDetails: unknown
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

const mutation = api.updateStatus.useMutation({
  onMutate: async (newData) => {
    await utils.updateStatus.cancel();
    const previousData = utils.updateStatus.getData();

    utils.updateStatus.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateStatus.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateStatus.invalidate();
  },
});
```

### `dashboard`

**Type:** `query`

Retrieves dashboard

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
  const { data, isLoading } = api.dashboard.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.dashboard.query({});
  
  return <div>{/* Use your data here */}</div>;
}
```

### `sendOrderEmail`

**Type:** `mutation`

Updates send order email

**Input:**
```typescript
z.object({
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
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

  const mutation = api.sendOrderEmail.useMutation({
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
  orderId: z.string(),
  recipientEmail: unknown,
  pdfContent: unknown
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

const mutation = api.sendOrderEmail.useMutation({
  onMutate: async (newData) => {
    await utils.sendOrderEmail.cancel();
    const previousData = utils.sendOrderEmail.getData();

    utils.sendOrderEmail.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.sendOrderEmail.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.sendOrderEmail.invalidate();
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