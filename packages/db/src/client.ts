import type { AnyD1Database } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createD1DrizzleClient(db: AnyD1Database) {
  return drizzle(db, { schema });
}

export const db = (() => {
  const {
    env: { DB },
  } = getRequestContext();
  return createD1DrizzleClient(DB);
})();
