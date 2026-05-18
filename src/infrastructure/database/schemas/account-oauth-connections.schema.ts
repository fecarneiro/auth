import { pgEnum, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { accountsTable } from './accounts.schema.js'

export const providersEnum = pgEnum('provider', ['github', 'google'])

export const accountOAuthConnectionsTable = pgTable(
  'account_oauth_connections',
  {
    id: uuid('id').primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsTable.id, {
        onDelete: 'cascade',
      }),
    provider: providersEnum().notNull(),
    providerUserId: text('provider_user_id').notNull(),
  },
  (table) => [
    uniqueIndex('account_oauth_provider_identity_unique').on(
      table.provider,
      table.providerUserId,
    ),
    uniqueIndex('account_oauth_account_provider_unique').on(
      table.accountId,
      table.provider,
    ),
  ],
)
