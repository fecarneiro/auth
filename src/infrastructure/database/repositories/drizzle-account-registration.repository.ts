import type { AccountRegistrationRepositoryPort } from '../../../application/ports/account/account-registration.repository.port.js'
import { db } from '../db.js'
import { accountOAuthConnectionsTable } from '../schemas/account-oauth-connections.schema.js'
import { accountPasswordsTable } from '../schemas/account-passwords.schema.js'
import { accountsTable } from '../schemas/accounts.schema.js'

export class DrizzleAccountRegistrationRepository
  implements AccountRegistrationRepositoryPort
{
  async createWithPassword(
    input: Parameters<
      AccountRegistrationRepositoryPort['createWithPassword']
    >[0],
  ): Promise<void> {
    const { account } = input

    if (account.passwordHash === null) {
      throw new Error(
        'createWithPassword requires an account that has a password',
      )
    }

    await db.transaction(async (tx) => {
      await tx.insert(accountsTable).values({
        id: account.id,
        email: account.email,
        name: account.name,
        createdAt: account.createdAt,
      })
      await tx.insert(accountPasswordsTable).values({
        accountId: account.id,
        passwordHash: account.passwordHash,
      })
    })
  }

  async createWithOAuthConnection(
    input: Parameters<
      AccountRegistrationRepositoryPort['createWithOAuthConnection']
    >[0],
  ): Promise<void> {
    const { account, oauthConnection } = input

    await db.transaction(async (tx) => {
      await tx.insert(accountsTable).values({
        id: account.id,
        email: account.email,
        name: account.name,
        createdAt: account.createdAt,
      })
      await tx.insert(accountOAuthConnectionsTable).values({
        id: oauthConnection.id,
        accountId: oauthConnection.accountId,
        provider: oauthConnection.provider,
        providerUserId: oauthConnection.providerUserId,
      })
    })
  }
}
