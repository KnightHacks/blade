import type { AnyD1Database } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createD1DrizzleClient(db: AnyD1Database) {
  return drizzle(db, { schema });
}

export const db = (() => {
  if (process.env.NODE_ENV === "development") {
    const {
      env: { DB },
    } = getRequestContext();
    return createD1DrizzleClient(DB);
  }

  // eslint-disable-next-line turbo/no-undeclared-env-vars -- DB will attached to process.env by the Cloudflare Worker runtime
  return createD1DrizzleClient(process.env.DB as unknown as D1Database);
})();
