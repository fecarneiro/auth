import { eq } from 'drizzle-orm'
import type {
  UserPassword,
  UserPasswordRepositoryPort,
} from '../../../application/ports/user-password.repository.port.js'
import { db } from '../db.js'
import { userPasswordsTable } from '../schema/user-password.schema.js'

export class DrizzleUserPasswordRepository
  implements UserPasswordRepositoryPort
{
  async save(userData: UserPassword): Promise<void> {
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
