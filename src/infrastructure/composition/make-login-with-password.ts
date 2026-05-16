import { LoginWithPasswordUseCase } from '../../application/use-cases/login-with-password/login-with-password.use-case.js'
import { BcryptHasher } from '../crypto/bcrypt-hasher.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { DrizzleUserRepository } from '../database/repository/drizzle-user.repository.js'
import { DrizzleUserPasswordRepository } from '../database/repository/drizzle-user-password.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository()
  const passwordRepository = new DrizzleUserPasswordRepository()
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
