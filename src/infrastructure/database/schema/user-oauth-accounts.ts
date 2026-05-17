import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const providersEnum = pgEnum('provider', ['github', 'google'])

export const userOAuthAccountsTable = pgTable('user_oauth_accounts', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  provider: providersEnum().notNull(),
  providerUserId: text().notNull().unique(),
})
