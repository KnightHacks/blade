import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createDbClient() {
  const {
    env: { DB },
  } = getRequestContext();

  return drizzle(DB, { schema });
}

export const db = createDbClient();
