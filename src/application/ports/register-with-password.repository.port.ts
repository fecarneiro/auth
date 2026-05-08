import type { User } from '../../domain/user.entity.js'

export interface UserAndPasswordInput {
  user: User
  passwordHash: string
}

export interface RegisterWithPasswordRepositoryPort {
  save(credential: UserAndPasswordInput): Promise<User | null>
}
