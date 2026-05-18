import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const accountsTable = pgTable('accounts', {
  id: uuid('id').primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
