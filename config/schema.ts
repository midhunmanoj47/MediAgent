import { pgTable, varchar, integer, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  credits: integer("credits").default(10)
});

export const sessionchattable = pgTable('sessionchattable', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId', { length: 64 }).notNull(),
  notes: varchar('notes', { length: 1024 }),
  conversation: jsonb('conversation').notNull(),
  report: jsonb('report').notNull(),
  createdBy: varchar('createdBy', { length: 128 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
