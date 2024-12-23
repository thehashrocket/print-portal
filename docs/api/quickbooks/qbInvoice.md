# Quickbooks/qb Invoice Router

This documentation describes all the available endpoints in the Quickbooks/qb Invoice router.

## Overview

The Quickbooks/qb Invoice router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `createQbInvoiceFromInvoice` | mutation | Updates create qb invoice from invoice |
| `createQbInvoiceFromOrder` | mutation | Updates create qb invoice from order |
| `getInvoicePdf` | mutation | Updates get invoice pdf |
| `sendInvoiceEmail` | mutation | Updates send invoice email |
| `syncInvoice` | mutation | Updates sync invoice |
| `syncInvoices` | query | Retrieves sync invoices |
| `syncInvoicesForOffice` | mutation | Updates sync invoices for office |
| `createQbInvoiceFromInvoice` | mutation | Updates create qb invoice from invoice |
| `createQbInvoiceFromOrder` | mutation | Updates create qb invoice from order |
| `getInvoicePdf` | mutation | Updates get invoice pdf |
| `sendInvoiceEmail` | mutation | Updates send invoice email |
| `syncInvoice` | mutation | Updates sync invoice |
| `syncInvoices` | query | Retrieves sync invoices |
| `syncInvoicesForOffice` | mutation | Updates sync invoices for office |

### `createQbInvoiceFromInvoice`

**Type:** `mutation`

Updates create qb invoice from invoice

**Input:**
```typescript
z.object({
  invoiceId: z.string()
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

  const mutation = api.createQbInvoiceFromInvoice.useMutation({
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
  invoiceId: z.string()
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

const mutation = api.createQbInvoiceFromInvoice.useMutation({
  onMutate: async (newData) => {
    await utils.createQbInvoiceFromInvoice.cancel();
    const previousData = utils.createQbInvoiceFromInvoice.getData();

    utils.createQbInvoiceFromInvoice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createQbInvoiceFromInvoice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createQbInvoiceFromInvoice.invalidate();
  },
});
```

### `createQbInvoiceFromOrder`

**Type:** `mutation`

Updates create qb invoice from order

**Input:**
```typescript
z.object({
  orderId: z.string()
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

  const mutation = api.createQbInvoiceFromOrder.useMutation({
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
  orderId: z.string()
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

const mutation = api.createQbInvoiceFromOrder.useMutation({
  onMutate: async (newData) => {
    await utils.createQbInvoiceFromOrder.cancel();
    const previousData = utils.createQbInvoiceFromOrder.getData();

    utils.createQbInvoiceFromOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createQbInvoiceFromOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createQbInvoiceFromOrder.invalidate();
  },
});
```

### `getInvoicePdf`

**Type:** `mutation`

Updates get invoice pdf

**Input:**
```typescript
z.object({
  quickbooksId: z.string()
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

  const mutation = api.getInvoicePdf.useMutation({
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
  quickbooksId: z.string()
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

const mutation = api.getInvoicePdf.useMutation({
  onMutate: async (newData) => {
    await utils.getInvoicePdf.cancel();
    const previousData = utils.getInvoicePdf.getData();

    utils.getInvoicePdf.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.getInvoicePdf.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.getInvoicePdf.invalidate();
  },
});
```

### `sendInvoiceEmail`

**Type:** `mutation`

Updates send invoice email

**Input:**
```typescript
z.object({
  quickbooksId: z.string(),
  recipientEmail: unknown
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

  const mutation = api.sendInvoiceEmail.useMutation({
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
  quickbooksId: z.string(),
  recipientEmail: unknown
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

const mutation = api.sendInvoiceEmail.useMutation({
  onMutate: async (newData) => {
    await utils.sendInvoiceEmail.cancel();
    const previousData = utils.sendInvoiceEmail.getData();

    utils.sendInvoiceEmail.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.sendInvoiceEmail.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.sendInvoiceEmail.invalidate();
  },
});
```

### `syncInvoice`

**Type:** `mutation`

Updates sync invoice

**Input:**
```typescript
z.object({
  orderId: z.string()
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

  const mutation = api.syncInvoice.useMutation({
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
  orderId: z.string()
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

const mutation = api.syncInvoice.useMutation({
  onMutate: async (newData) => {
    await utils.syncInvoice.cancel();
    const previousData = utils.syncInvoice.getData();

    utils.syncInvoice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncInvoice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncInvoice.invalidate();
  },
});
```

### `syncInvoices`

**Type:** `query`

Retrieves sync invoices

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
  const { data, isLoading } = api.syncInvoices.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.syncInvoices.query({});
  
  return <div>{/* Use your data here */}</div>;
}
```

### `syncInvoicesForOffice`

**Type:** `mutation`

Updates sync invoices for office

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

  const mutation = api.syncInvoicesForOffice.useMutation({
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

const mutation = api.syncInvoicesForOffice.useMutation({
  onMutate: async (newData) => {
    await utils.syncInvoicesForOffice.cancel();
    const previousData = utils.syncInvoicesForOffice.getData();

    utils.syncInvoicesForOffice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncInvoicesForOffice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncInvoicesForOffice.invalidate();
  },
});
```

### `createQbInvoiceFromInvoice`

**Type:** `mutation`

Updates create qb invoice from invoice

**Input:**
```typescript
z.object({
  invoiceId: z.string()
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

  const mutation = api.createQbInvoiceFromInvoice.useMutation({
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
  invoiceId: z.string()
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

const mutation = api.createQbInvoiceFromInvoice.useMutation({
  onMutate: async (newData) => {
    await utils.createQbInvoiceFromInvoice.cancel();
    const previousData = utils.createQbInvoiceFromInvoice.getData();

    utils.createQbInvoiceFromInvoice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createQbInvoiceFromInvoice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createQbInvoiceFromInvoice.invalidate();
  },
});
```

### `createQbInvoiceFromOrder`

**Type:** `mutation`

Updates create qb invoice from order

**Input:**
```typescript
z.object({
  orderId: z.string()
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

  const mutation = api.createQbInvoiceFromOrder.useMutation({
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
  orderId: z.string()
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

const mutation = api.createQbInvoiceFromOrder.useMutation({
  onMutate: async (newData) => {
    await utils.createQbInvoiceFromOrder.cancel();
    const previousData = utils.createQbInvoiceFromOrder.getData();

    utils.createQbInvoiceFromOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createQbInvoiceFromOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createQbInvoiceFromOrder.invalidate();
  },
});
```

### `getInvoicePdf`

**Type:** `mutation`

Updates get invoice pdf

**Input:**
```typescript
z.object({
  quickbooksId: z.string()
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

  const mutation = api.getInvoicePdf.useMutation({
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
  quickbooksId: z.string()
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

const mutation = api.getInvoicePdf.useMutation({
  onMutate: async (newData) => {
    await utils.getInvoicePdf.cancel();
    const previousData = utils.getInvoicePdf.getData();

    utils.getInvoicePdf.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.getInvoicePdf.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.getInvoicePdf.invalidate();
  },
});
```

### `sendInvoiceEmail`

**Type:** `mutation`

Updates send invoice email

**Input:**
```typescript
z.object({
  quickbooksId: z.string(),
  recipientEmail: unknown
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

  const mutation = api.sendInvoiceEmail.useMutation({
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
  quickbooksId: z.string(),
  recipientEmail: unknown
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

const mutation = api.sendInvoiceEmail.useMutation({
  onMutate: async (newData) => {
    await utils.sendInvoiceEmail.cancel();
    const previousData = utils.sendInvoiceEmail.getData();

    utils.sendInvoiceEmail.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.sendInvoiceEmail.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.sendInvoiceEmail.invalidate();
  },
});
```

### `syncInvoice`

**Type:** `mutation`

Updates sync invoice

**Input:**
```typescript
z.object({
  orderId: z.string()
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

  const mutation = api.syncInvoice.useMutation({
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
  orderId: z.string()
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

const mutation = api.syncInvoice.useMutation({
  onMutate: async (newData) => {
    await utils.syncInvoice.cancel();
    const previousData = utils.syncInvoice.getData();

    utils.syncInvoice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncInvoice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncInvoice.invalidate();
  },
});
```

### `syncInvoices`

**Type:** `query`

Retrieves sync invoices

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
  const { data, isLoading } = api.syncInvoices.useQuery({});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.syncInvoices.query({});
  
  return <div>{/* Use your data here */}</div>;
}
```

### `syncInvoicesForOffice`

**Type:** `mutation`

Updates sync invoices for office

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

  const mutation = api.syncInvoicesForOffice.useMutation({
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

const mutation = api.syncInvoicesForOffice.useMutation({
  onMutate: async (newData) => {
    await utils.syncInvoicesForOffice.cancel();
    const previousData = utils.syncInvoicesForOffice.getData();

    utils.syncInvoicesForOffice.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.syncInvoicesForOffice.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.syncInvoicesForOffice.invalidate();
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