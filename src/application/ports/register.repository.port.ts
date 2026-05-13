import type { User } from '../../domain/user.entity.js'

export interface RegisterInput {
  user: User
  passwordHash: string
}

export interface RegisterPort {
  save(credential: RegisterInput): Promise<void>
}
