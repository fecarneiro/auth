import { LoginWithPasswordUseCase } from '../../application/use-cases/login-with-password/login-with-password.use-case.js'
import { BcryptPasswordHasher } from '../crypto/bcrypt-password-hasher.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { DrizzleAccountRepository } from '../database/repositories/drizzle-account.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeLoginUseCase() {
  const accountRepository = new DrizzleAccountRepository()
  const hasher = new BcryptPasswordHasher()
  const randomSessionIdGenerator = new RandomSessionIdGenerator()
  const sessionStore = new RedisSessionStore()

  return new LoginWithPasswordUseCase(
    accountRepository,
    hasher,
    randomSessionIdGenerator,
    sessionStore,
  )
}
