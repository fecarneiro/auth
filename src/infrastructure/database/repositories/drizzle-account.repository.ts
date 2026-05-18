import { eq } from 'drizzle-orm'
import type { AccountRepositoryPort } from '../../../application/ports/account/account.repository.port.js'
import type { OAuthConnection } from '../../../domain/account.entity.js'
import { Account } from '../../../domain/account.entity.js'
import { AccountEmail } from '../../../domain/account-email.vo.js'
import { db } from '../db.js'
import { accountOAuthConnectionsTable } from '../schemas/account-oauth-connections.schema.js'
import { accountPasswordsTable } from '../schemas/account-passwords.schema.js'
import { accountsTable } from '../schemas/accounts.schema.js'

export class DrizzleAccountRepository implements AccountRepositoryPort {
  async findByEmail(email: string): Promise<Account | null> {
    const rows = await db
      .select({
        id: accountsTable.id,
        email: accountsTable.email,
        name: accountsTable.name,
        createdAt: accountsTable.createdAt,
        passwordHash: accountPasswordsTable.passwordHash,
        oauthProvider: accountOAuthConnectionsTable.provider,
        oauthProviderUserId: accountOAuthConnectionsTable.providerUserId,
      })
      .from(accountsTable)
      .leftJoin(
        accountPasswordsTable,
        eq(accountPasswordsTable.accountId, accountsTable.id),
      )
      .leftJoin(
        accountOAuthConnectionsTable,
        eq(accountOAuthConnectionsTable.accountId, accountsTable.id),
      )
      .where(eq(accountsTable.email, AccountEmail.normalize(email)))

    return restoreAccountFromRows(rows)
  }

  async findById(id: string): Promise<Account | null> {
    const rows = await db
      .select({
        id: accountsTable.id,
        email: accountsTable.email,
        name: accountsTable.name,
        createdAt: accountsTable.createdAt,
        passwordHash: accountPasswordsTable.passwordHash,
        oauthProvider: accountOAuthConnectionsTable.provider,
        oauthProviderUserId: accountOAuthConnectionsTable.providerUserId,
      })
      .from(accountsTable)
      .leftJoin(
        accountPasswordsTable,
        eq(accountPasswordsTable.accountId, accountsTable.id),
      )
      .leftJoin(
        accountOAuthConnectionsTable,
        eq(accountOAuthConnectionsTable.accountId, accountsTable.id),
      )
      .where(eq(accountsTable.id, id))

    return restoreAccountFromRows(rows)
  }
}

type AccountRow = {
  id: string
  email: string
  name: string
  createdAt: Date
  passwordHash: string | null
  oauthProvider: OAuthConnection['provider'] | null
  oauthProviderUserId: string | null
}

function restoreAccountFromRows(rows: AccountRow[]): Account | null {
  const firstRow = rows[0]
  if (!firstRow) return null

  const oauthConnections = rows.flatMap((row): OAuthConnection[] => {
    if (!row.oauthProvider || !row.oauthProviderUserId) return []

    return [
      {
        provider: row.oauthProvider,
        providerUserId: row.oauthProviderUserId,
      },
    ]
  })

  return Account.restore({
    id: firstRow.id,
    email: firstRow.email,
    name: firstRow.name,
    createdAt: firstRow.createdAt,
    passwordHash: firstRow.passwordHash,
    oauthConnections,
  })
}
