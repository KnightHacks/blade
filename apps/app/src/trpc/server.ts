import type { AppRouter } from "@blade/api";
import { cache } from "react";
import { headers } from "next/headers";
import { createCaller, createTRPCContext } from "@blade/api";
import { createD1DrizzleClient } from "@blade/db/client";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  const {
    env: { DB },
  } = getRequestContext();
  const db = createD1DrizzleClient(DB);
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    db,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
