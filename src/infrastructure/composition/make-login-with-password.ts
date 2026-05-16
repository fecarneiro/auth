import { LoginWithPasswordUseCase } from '../../application/use-cases/login-with-password/login-with-password.use-case.js'
import { BcryptHasher } from '../crypto/bcrypt-hasher.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { DrizzlepasswordRepository } from '../database/repository/drizzle-password.repository.js'
import { DrizzleUserRepository } from '../database/repository/drizzle-user.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository()
  const passwordRepository = new DrizzlepasswordRepository()
  const hasher = new BcryptHasher()
  const randomSessionIdGenerator = new RandomSessionIdGenerator()
  const sessionStore = new RedisSessionStore()

  return new LoginWithPasswordUseCase(
    userRepository,
    passwordRepository,
    hasher,
    randomSessionIdGenerator,
    sessionStore,
  )
}
