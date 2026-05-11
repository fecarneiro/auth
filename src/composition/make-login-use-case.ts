import { LoginUseCase } from '../application/use-cases/login/login.use-case.js'
import { RedisSessionStore } from '../infrastructure/cache/redis-session-store.js'
import { BcryptHasher } from '../infrastructure/crypto/bcrypt-hasher.js'
import { DrizzlepasswordRepository } from '../infrastructure/database/repository/drizzle-password.repository.js'
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js'

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository()
  const passwordRepository = new DrizzlepasswordRepository()
  const hasher = new BcryptHasher()
  const sessionStore = new RedisSessionStore()

  return new LoginUseCase(
    userRepository,
    passwordRepository,
    hasher,
    sessionStore,
  )
}
