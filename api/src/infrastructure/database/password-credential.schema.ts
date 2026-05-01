import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const passwordCredentialsTable = pgTable('password_credentials', {
  userId: varchar('user_id', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
});
