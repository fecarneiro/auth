import type {
  RegisterInput,
  RegisterRepositoryPort,
} from '../../../application/ports/register.repository.port.js'
import { db } from '../db.js'
import { usersTable } from '../schema/user.schema.js'
import { userPasswordsTable } from '../schema/user-password.schema.js'

export class DrizzleRegisterRepository implements RegisterRepositoryPort {
  async save(userData: RegisterInput): Promise<void> {
    const user = userData.user
    const passwordHash = userData.passwordHash

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })
      await tx.insert(userPasswordsTable).values({
        userId: userData.user.id,
        passwordHash: passwordHash,
      })
    })
  }
}
