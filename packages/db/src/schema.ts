import type { InferSelectModel } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";

// export const Post = pgTable("post", (t) => ({
//   id: t.uuid().notNull().primaryKey().defaultRandom(),
//   title: t.varchar({ length: 256 }).notNull(),
//   content: t.text().notNull(),
//   createdAt: t.timestamp().defaultNow().notNull(),
//   updatedAt: t
//     .timestamp({ mode: "date", withTimezone: true })
//     .$onUpdateFn(() => sql`now()`),
// }));

// export const CreatePostSchema = createInsertSchema(Post, {
//   title: z.string().max(256),
//   content: z.string().max(256),
// }).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });

export const UserTable = pgTable("user", (t) => ({
  id: t.serial().primaryKey(),
  discordId: t.varchar({ length: 32 }).notNull().unique(),
  discordUsername: t.varchar({ length: 32 }).notNull(),
}));

export const SessionTable = pgTable("session", (t) => ({
  id: t.text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => UserTable.id),
  expiresAt: t
    .timestamp({
      withTimezone: true,
      mode: "date",
    })
    .notNull(),
}));

export type User = InferSelectModel<typeof UserTable>;
export type Session = InferSelectModel<typeof SessionTable>;
