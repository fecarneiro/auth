import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

const providersEnum = pgEnum('provider', ['github', 'google'])

export const userPasswordsTable = pgTable('user_passwords', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  provider: providersEnum().notNull(),
  providerUserIid: text().notNull().unique(),
})
