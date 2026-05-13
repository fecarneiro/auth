import type {
  RegisterInput,
  RegisterPort,
} from '../../../application/ports/register.repository.port.js'
import { db } from '../db.js'
import { passwordTable } from '../schema/password.schema.js'
import { usersTable } from '../schema/user.schema.js'

export class DrizzleRegisterRepository implements RegisterPort {
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
      await tx.insert(passwordTable).values({
        userId: userData.user.id,
        passwordHash: passwordHash,
      })
    })
  }
}
