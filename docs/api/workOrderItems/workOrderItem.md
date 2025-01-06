# Work Order Items/work Order Item Router

This documentation describes all the available endpoints in the Work Order Items/work Order Item router.

## Overview

The Work Order Items/work Order Item router provides the following endpoints:

| Endpoint | Type | Description |
|----------|------|-------------|
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `createWorkOrderItem` | mutation | Updates create work order item |
| `getByWorkOrderId` | query | Retrieves get by work order id |
| `updateArtwork` | mutation | Updates update artwork |
| `update` | mutation | Updates update |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |
| `deleteArtwork` | mutation | Updates delete artwork |
| `getByID` | query | Retrieves get by i d |
| `getAll` | query | Retrieves get all |
| `createWorkOrderItem` | mutation | Updates create work order item |
| `getByWorkOrderId` | query | Retrieves get by work order id |
| `updateArtwork` | mutation | Updates update artwork |
| `update` | mutation | Updates update |
| `updateDescription` | mutation | Updates update description |
| `updateSpecialInstructions` | mutation | Updates update special instructions |
| `updateStatus` | mutation | Updates update status |
| `deleteArtwork` | mutation | Updates delete artwork |

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

### `createWorkOrderItem`

**Type:** `mutation`

Updates create work order item

**Input:**
```typescript
z.object({
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  paperProductId: unknown,
  prepTime: z.number(),
  productTypeId: unknown,
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
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

  const mutation = api.createWorkOrderItem.useMutation({
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
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  paperProductId: unknown,
  prepTime: z.number(),
  productTypeId: unknown,
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
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

const mutation = api.createWorkOrderItem.useMutation({
  onMutate: async (newData) => {
    await utils.createWorkOrderItem.cancel();
    const previousData = utils.createWorkOrderItem.getData();

    utils.createWorkOrderItem.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createWorkOrderItem.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createWorkOrderItem.invalidate();
  },
});
```

### `getByWorkOrderId`

**Type:** `query`

Retrieves get by work order id

**Input:**
```typescript
z.object({
  workOrderId: z.string()
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
  const { data, isLoading } = api.getByWorkOrderId.useQuery(z.object({
  workOrderId: "example"
}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByWorkOrderId.query(z.object({
  workOrderId: "example"
}));
  
  return <div>{/* Use your data here */}</div>;
}
```

### `updateArtwork`

**Type:** `mutation`

Updates update artwork

**Input:**
```typescript
z.object({
  workOrderItemId: z.string(),
  artwork: z.array()
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

  const mutation = api.updateArtwork.useMutation({
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
  workOrderItemId: z.string(),
  artwork: z.array()
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

const mutation = api.updateArtwork.useMutation({
  onMutate: async (newData) => {
    await utils.updateArtwork.cancel();
    const previousData = utils.updateArtwork.getData();

    utils.updateArtwork.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateArtwork.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateArtwork.invalidate();
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
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  paperProductId: unknown,
  productTypeId: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  paperProductId: unknown,
  productTypeId: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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

### `updateDescription`

**Type:** `mutation`

Updates update description

**Input:**
```typescript
z.object({
  id: z.string(),
  description: z.string()
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

  const mutation = api.updateDescription.useMutation({
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
  description: z.string()
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

const mutation = api.updateDescription.useMutation({
  onMutate: async (newData) => {
    await utils.updateDescription.cancel();
    const previousData = utils.updateDescription.getData();

    utils.updateDescription.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateDescription.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateDescription.invalidate();
  },
});
```

### `updateSpecialInstructions`

**Type:** `mutation`

Updates update special instructions

**Input:**
```typescript
z.object({
  id: z.string(),
  specialInstructions: z.string()
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

  const mutation = api.updateSpecialInstructions.useMutation({
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
  specialInstructions: z.string()
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

const mutation = api.updateSpecialInstructions.useMutation({
  onMutate: async (newData) => {
    await utils.updateSpecialInstructions.cancel();
    const previousData = utils.updateSpecialInstructions.getData();

    utils.updateSpecialInstructions.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateSpecialInstructions.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateSpecialInstructions.invalidate();
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

### `deleteArtwork`

**Type:** `mutation`

Updates delete artwork

**Input:**
```typescript
z.object({
  artworkId: z.string()
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

  const mutation = api.deleteArtwork.useMutation({
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
  artworkId: z.string()
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

const mutation = api.deleteArtwork.useMutation({
  onMutate: async (newData) => {
    await utils.deleteArtwork.cancel();
    const previousData = utils.deleteArtwork.getData();

    utils.deleteArtwork.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.deleteArtwork.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.deleteArtwork.invalidate();
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

### `createWorkOrderItem`

**Type:** `mutation`

Updates create work order item

**Input:**
```typescript
z.object({
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  paperProductId: unknown,
  prepTime: z.number(),
  productTypeId: unknown,
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
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

  const mutation = api.createWorkOrderItem.useMutation({
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
  amount: unknown,
  artwork: z.array(),
  cost: unknown,
  description: z.string(),
  expectedDate: z.date(),
  ink: unknown,
  other: z.string(),
  paperProductId: unknown,
  prepTime: z.number(),
  productTypeId: unknown,
  quantity: z.number(),
  size: z.string(),
  specialInstructions: z.string(),
  status: z.nativeEnum(),
  workOrderId: z.string()
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

const mutation = api.createWorkOrderItem.useMutation({
  onMutate: async (newData) => {
    await utils.createWorkOrderItem.cancel();
    const previousData = utils.createWorkOrderItem.getData();

    utils.createWorkOrderItem.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.createWorkOrderItem.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.createWorkOrderItem.invalidate();
  },
});
```

### `getByWorkOrderId`

**Type:** `query`

Retrieves get by work order id

**Input:**
```typescript
z.object({
  workOrderId: z.string()
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
  const { data, isLoading } = api.getByWorkOrderId.useQuery(z.object({
  workOrderId: "example"
}));

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
```

#### Server Component
```typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.getByWorkOrderId.query(z.object({
  workOrderId: "example"
}));
  
  return <div>{/* Use your data here */}</div>;
}
```

### `updateArtwork`

**Type:** `mutation`

Updates update artwork

**Input:**
```typescript
z.object({
  workOrderItemId: z.string(),
  artwork: z.array()
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

  const mutation = api.updateArtwork.useMutation({
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
  workOrderItemId: z.string(),
  artwork: z.array()
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

const mutation = api.updateArtwork.useMutation({
  onMutate: async (newData) => {
    await utils.updateArtwork.cancel();
    const previousData = utils.updateArtwork.getData();

    utils.updateArtwork.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateArtwork.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateArtwork.invalidate();
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
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  paperProductId: unknown,
  productTypeId: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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
  data: {
  amount: unknown,
  cost: unknown,
  description: unknown,
  expectedDate: unknown,
  ink: unknown,
  other: unknown,
  paperProductId: unknown,
  productTypeId: unknown,
  quantity: unknown,
  size: unknown,
  specialInstructions: unknown,
  status: unknown,
  workOrderId: unknown
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

### `updateDescription`

**Type:** `mutation`

Updates update description

**Input:**
```typescript
z.object({
  id: z.string(),
  description: z.string()
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

  const mutation = api.updateDescription.useMutation({
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
  description: z.string()
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

const mutation = api.updateDescription.useMutation({
  onMutate: async (newData) => {
    await utils.updateDescription.cancel();
    const previousData = utils.updateDescription.getData();

    utils.updateDescription.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateDescription.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateDescription.invalidate();
  },
});
```

### `updateSpecialInstructions`

**Type:** `mutation`

Updates update special instructions

**Input:**
```typescript
z.object({
  id: z.string(),
  specialInstructions: z.string()
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

  const mutation = api.updateSpecialInstructions.useMutation({
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
  specialInstructions: z.string()
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

const mutation = api.updateSpecialInstructions.useMutation({
  onMutate: async (newData) => {
    await utils.updateSpecialInstructions.cancel();
    const previousData = utils.updateSpecialInstructions.getData();

    utils.updateSpecialInstructions.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.updateSpecialInstructions.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.updateSpecialInstructions.invalidate();
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

### `deleteArtwork`

**Type:** `mutation`

Updates delete artwork

**Input:**
```typescript
z.object({
  artworkId: z.string()
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

  const mutation = api.deleteArtwork.useMutation({
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
  artworkId: z.string()
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

const mutation = api.deleteArtwork.useMutation({
  onMutate: async (newData) => {
    await utils.deleteArtwork.cancel();
    const previousData = utils.deleteArtwork.getData();

    utils.deleteArtwork.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.deleteArtwork.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.deleteArtwork.invalidate();
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