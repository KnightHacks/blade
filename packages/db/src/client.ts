import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing DATABASE_URL");
}

const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(sql, { schema });
