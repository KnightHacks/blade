import type { InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const UserTable = sqliteTable("user", (t) => ({
  id: t.integer().primaryKey({
    autoIncrement: true,
  }),
  discordId: t.text({ length: 32 }).notNull().unique(),
  discordUsername: t.text({ length: 32 }).notNull(),
}));

export const SessionTable = sqliteTable("session", (t) => ({
  id: t.text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => UserTable.id),
  expiresAt: t
    .integer({
      mode: "timestamp",
    })
    .notNull(),
}));

export type User = InferSelectModel<typeof UserTable>;
export type Session = InferSelectModel<typeof SessionTable>;
