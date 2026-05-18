import type { AccountRegistrationRepositoryPort } from '../../../application/ports/account/account-registration.repository.port.js'
import { OAuthConnectionAlreadyExistsError } from '../../../application/use-cases/link-oauth-provider/link-oauth-provider.errors.js'
import { EmailAlreadyInUseError } from '../../../application/use-cases/register-with-password/register-with-password.errors.js'
import { db } from '../db.js'
import { isUniqueViolation } from '../postgres-errors.js'
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
    const { passwordHash } = account

    if (passwordHash === null) {
      throw new Error(
        'createWithPassword requires an account that has a password',
      )
    }

    try {
      await db.transaction(async (tx) => {
        await tx.insert(accountsTable).values({
          id: account.id,
          email: account.email,
          name: account.name,
          createdAt: account.createdAt,
        })
        await tx.insert(accountPasswordsTable).values({
          accountId: account.id,
          passwordHash,
        })
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyInUseError()
      }
      throw error
    }
  }

  async createWithOAuthConnection(
    input: Parameters<
      AccountRegistrationRepositoryPort['createWithOAuthConnection']
    >[0],
  ): Promise<void> {
    const { account, oauthConnection } = input

    try {
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
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new OAuthConnectionAlreadyExistsError()
      }
      throw error
    }
  }
}
