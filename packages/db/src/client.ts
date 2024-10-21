import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createDbClient() {
  if (process.env.NODE_ENV === "development") {
    const {
      env: { DB },
    } = getRequestContext();
    return drizzle(DB, { schema });
  }

  // eslint-disable-next-line turbo/no-undeclared-env-vars -- DB will be attached to `process.env` by the Cloudflare runtime
  return drizzle(process.env.DB as unknown as D1Database, { schema });
}

export const db = createDbClient();
