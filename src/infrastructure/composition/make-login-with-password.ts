import { LoginWithPasswordUseCase } from '../../application/use-cases/login-with-password/login-with-password.use-case.js'
import { BcryptPasswordHasher } from '../crypto/bcrypt-password-hasher.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { DrizzlePasswordCredentialRepository } from '../database/repositories/drizzle-password-credential.repository.js'
import { DrizzleUserRepository } from '../database/repositories/drizzle-user.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository()
  const passwordRepository = new DrizzlePasswordCredentialRepository()
  const hasher = new BcryptPasswordHasher()
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
