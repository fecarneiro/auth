import type {
  RegisterInput,
  RegisterPort,
} from '../../../application/ports/register.repository.port.js'
import type { User } from '../../../domain/user.entity.js'
import { db } from '../db.js'
import { passwordTable } from '../schema/password.schema.js'
import { usersTable } from '../schema/user.schema.js'

export class DrizzleRegisterRepository implements RegisterPort {
  async save(credential: RegisterInput): Promise<User | null> {
    const user = credential.user
    const passwordHash = credential.passwordHash

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })
      await tx.insert(passwordTable).values({
        userId: credential.user.id,
        passwordHash: passwordHash,
      })
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }
  }
}
