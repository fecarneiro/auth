import type { User } from '../../domain/user.entity.js'

export interface RegisterUserWithPassowordRepositoryPort {
  saveUserWithPassoword(credential: {
    user: User
    passwordHash: string
  }): Promise<void>
}
