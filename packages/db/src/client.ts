import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createD1DrizzleClient(db: AnyD1Database) {
  return drizzle(db, { schema });
}
