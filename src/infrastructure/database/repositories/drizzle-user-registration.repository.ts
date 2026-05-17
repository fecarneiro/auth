import type { UserRegistrationRepositoryPort } from '../../../application/ports/user/user-registration.repository.port.js'
import { db } from '../db.js'
import { userOAuthAccountsTable } from '../schemas/user-oauth-accounts.schema.js'
import { userPasswordsTable } from '../schemas/user-passwords.schema.js'
import { usersTable } from '../schemas/users.schema.js'

export class DrizzleUserRegistrationRepository
  implements UserRegistrationRepositoryPort
{
  async createWithPassword(
    input: Parameters<UserRegistrationRepositoryPort['createWithPassword']>[0],
  ): Promise<void> {
    const { user, passwordCredential } = input

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })
      await tx.insert(userPasswordsTable).values({
        userId: passwordCredential.userId,
        passwordHash: passwordCredential.passwordHash,
      })
    })
  }

  async createWithOAuthAccount(
    input: Parameters<
      UserRegistrationRepositoryPort['createWithOAuthAccount']
    >[0],
  ): Promise<void> {
    const { user, oauthAccount } = input

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })
      await tx.insert(userOAuthAccountsTable).values({
        id: oauthAccount.id,
        userId: oauthAccount.userId,
        provider: oauthAccount.provider,
        providerUserId: oauthAccount.providerUserId,
      })
    })
  }
}
