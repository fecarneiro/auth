import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { accountsTable } from './accounts.schema.js'

export const accountPasswordsTable = pgTable('account_passwords', {
  accountId: uuid('account_id')
    .primaryKey()
    .references(() => accountsTable.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
})
