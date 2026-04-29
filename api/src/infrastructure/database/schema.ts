import { sql } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`uuidv7()`),

  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),

  passwordHash: varchar('password_hash', { length: 255 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
