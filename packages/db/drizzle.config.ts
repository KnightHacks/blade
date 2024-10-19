import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./src/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.LOCAL_DATABASE_URL!,
  },
  casing: "camelCase",
} satisfies Config;
