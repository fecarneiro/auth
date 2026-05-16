import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { usersTable } from './user.schema.js'

export const userPasswordsTable = pgTable('user_passwords', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }),
})
