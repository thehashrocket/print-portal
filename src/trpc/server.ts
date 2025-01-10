import "server-only";

import { headers, type UnsafeUnwrappedHeaders } from "next/headers";
import { cache } from "react";

import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const createHeaders = async () => {
    const headerData = await headers();
    return new Headers((headerData as unknown as UnsafeUnwrappedHeaders));
  };

  const heads = await createHeaders();
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

export const api = createCaller(createContext);
