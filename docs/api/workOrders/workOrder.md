# Work Orders/work Order Router

This documentation describes all the available endpoints in the Work Orders/work Order router.

## Overview

The Work Orders/work Order router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `createWorkOrder` | mutation | Updates create work order |
| `getAll` | query | Retrieves get all |
| `updateStatus` | mutation | Updates update status |
| `addShippingInfo` | mutation | Updates add shipping info |
| `convertWorkOrderToOrder` | mutation | Updates convert work order to order |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |
| `getByID` | query | Retrieves get by i d |
| `createWorkOrder` | mutation | Updates create work order |
| `getAll` | query | Retrieves get all |
| `updateStatus` | mutation | Updates update status |
| `addShippingInfo` | mutation | Updates add shipping info |
| `convertWorkOrderToOrder` | mutation | Updates convert work order to order |
| `updateContactPerson` | mutation | Updates update contact person |
| `updateShippingInfo` | mutation | Updates update shipping info |

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

### `createWorkOrder`

**Type:** `mutation`

Updates create work order

**Input:**
```typescript
z.object({
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: unknown,
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
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

  const mutation = api.createWorkOrder.useMutation({
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
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: unknown,
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
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

const mutation = api.createWorkOrder.useMutation({
  onMutate: async (newData) => {
    await utils.createWorkOrder.cancel();
    const previousData = utils.createWorkOrder.getData();

    utils.createWorkOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createWorkOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createWorkOrder.invalidate();
  },
});
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

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum()
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
  status: z.nativeEnum()
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

### `addShippingInfo`

**Type:** `mutation`

Updates add shipping info

**Input:**
```typescript
z.object({
  id: z.string(),
  shippingInfoId: z.string()
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

  const mutation = api.addShippingInfo.useMutation({
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
  shippingInfoId: z.string()
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

const mutation = api.addShippingInfo.useMutation({
  onMutate: async (newData) => {
    await utils.addShippingInfo.cancel();
    const previousData = utils.addShippingInfo.getData();

    utils.addShippingInfo.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.addShippingInfo.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.addShippingInfo.invalidate();
  },
});
```

### `convertWorkOrderToOrder`

**Type:** `mutation`

Updates convert work order to order

**Input:**
```typescript
z.object({
  id: z.string(),
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

  const mutation = api.convertWorkOrderToOrder.useMutation({
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

const mutation = api.convertWorkOrderToOrder.useMutation({
  onMutate: async (newData) => {
    await utils.convertWorkOrderToOrder.cancel();
    const previousData = utils.convertWorkOrderToOrder.getData();

    utils.convertWorkOrderToOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.convertWorkOrderToOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.convertWorkOrderToOrder.invalidate();
  },
});
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  workOrderId: z.string(),
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
  workOrderId: z.string(),
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
  workOrderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
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
  workOrderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
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

### `createWorkOrder`

**Type:** `mutation`

Updates create work order

**Input:**
```typescript
z.object({
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: unknown,
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
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

  const mutation = api.createWorkOrder.useMutation({
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
  dateIn: z.date(),
  estimateNumber: unknown,
  contactPersonId: unknown,
  inHandsDate: z.date(),
  invoicePrintEmail: z.nativeEnum(),
  officeId: z.string(),
  purchaseOrderNumber: unknown,
  shippingInfoId: unknown,
  status: z.nativeEnum(),
  workOrderNumber: unknown,
  workOrderItems: unknown
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

const mutation = api.createWorkOrder.useMutation({
  onMutate: async (newData) => {
    await utils.createWorkOrder.cancel();
    const previousData = utils.createWorkOrder.getData();

    utils.createWorkOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createWorkOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createWorkOrder.invalidate();
  },
});
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

### `updateStatus`

**Type:** `mutation`

Updates update status

**Input:**
```typescript
z.object({
  id: z.string(),
  status: z.nativeEnum()
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
  status: z.nativeEnum()
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

### `addShippingInfo`

**Type:** `mutation`

Updates add shipping info

**Input:**
```typescript
z.object({
  id: z.string(),
  shippingInfoId: z.string()
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

  const mutation = api.addShippingInfo.useMutation({
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
  shippingInfoId: z.string()
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

const mutation = api.addShippingInfo.useMutation({
  onMutate: async (newData) => {
    await utils.addShippingInfo.cancel();
    const previousData = utils.addShippingInfo.getData();

    utils.addShippingInfo.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.addShippingInfo.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.addShippingInfo.invalidate();
  },
});
```

### `convertWorkOrderToOrder`

**Type:** `mutation`

Updates convert work order to order

**Input:**
```typescript
z.object({
  id: z.string(),
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

  const mutation = api.convertWorkOrderToOrder.useMutation({
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

const mutation = api.convertWorkOrderToOrder.useMutation({
  onMutate: async (newData) => {
    await utils.convertWorkOrderToOrder.cancel();
    const previousData = utils.convertWorkOrderToOrder.getData();

    utils.convertWorkOrderToOrder.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.convertWorkOrderToOrder.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.convertWorkOrderToOrder.invalidate();
  },
});
```

### `updateContactPerson`

**Type:** `mutation`

Updates update contact person

**Input:**
```typescript
z.object({
  workOrderId: z.string(),
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
  workOrderId: z.string(),
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
  workOrderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
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
  workOrderId: z.string(),
  shippingInfo: {
  addressId: unknown,
  instructions: unknown,
  shippingCost: unknown,
  shippingDate: unknown,
  shippingNotes: unknown,
  shippingMethod: z.string(),
  shippingOther: unknown,
  trackingNumber: unknown,
  ShippingPickup: unknown
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