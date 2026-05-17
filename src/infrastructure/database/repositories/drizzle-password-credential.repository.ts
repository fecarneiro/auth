import { eq } from 'drizzle-orm'
import type {
  PasswordCredential,
  PasswordCredentialRepositoryPort,
} from '../../../application/ports/password/password-credential.repository.port.js'
import { db } from '../db.js'
import { userPasswordsTable } from '../schemas/user-passwords.schema.js'

export class DrizzlePasswordCredentialRepository
  implements PasswordCredentialRepositoryPort
{
  async save(userData: PasswordCredential): Promise<void> {
    await db.insert(userPasswordsTable).values({
      userId: userData.userId,
      passwordHash: userData.passwordHash,
    })
  }

  async findByUserId(
    userId: string,
  ): Promise<{ userId: string; passwordHash: string } | null> {
    const [row] = await db
      .select({
        userId: userPasswordsTable.userId,
        passwordHash: userPasswordsTable.passwordHash,
      })
      .from(userPasswordsTable)
      .where(eq(userPasswordsTable.userId, userId))
      .limit(1)

    if (!row) return null

    if (!row?.passwordHash || !row?.userId) return null

    return {
      userId: row.userId,
      passwordHash: row.passwordHash,
    }
  }
}
