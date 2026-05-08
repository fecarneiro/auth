import { eq } from 'drizzle-orm'
import type {
  PasswordRepositoryPort,
  password,
} from '../../../application/ports/password.repository.port.js'
import { db } from '../db.js'
import { passwordTable } from '../schema/password.schema.js'

export class DrizzlepasswordRepository implements PasswordRepositoryPort {
  async save(credential: password): Promise<void> {
    await db.insert(passwordTable).values({
      userId: credential.userId,
      passwordHash: credential.passwordHash,
    })
  }

  async findByUserId(
    userId: string,
  ): Promise<{ userId: string; passwordHash: string } | null> {
    const [row] = await db
      .select({
        userId: passwordTable.userId,
        passwordHash: passwordTable.passwordHash,
      })
      .from(passwordTable)
      .where(eq(passwordTable.userId, userId))
      .limit(1)

    if (!row) return null

    if (!row?.passwordHash || !row?.userId) return null

    return {
      userId: row.userId,
      passwordHash: row.passwordHash,
    }
  }
}
