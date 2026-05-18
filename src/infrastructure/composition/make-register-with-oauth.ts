import { RegisterWithOAuthUseCase } from '../../application/use-cases/register-with-oauth/register-with-oauth.use-case.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { UuidV7IdGenerator } from '../crypto/uuid-v7-id-generator.js'
import { DrizzleAccountRepository } from '../database/repositories/drizzle-account.repository.js'
import { DrizzleAccountRegistrationRepository } from '../database/repositories/drizzle-account-registration.repository.js'
import { DrizzleOAuthConnectionRepository } from '../database/repositories/drizzle-oauth-connection.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeRegisterWithOAuthUseCase() {
  const oauthConnectionRepository = new DrizzleOAuthConnectionRepository()
  const accountRepository = new DrizzleAccountRepository()
  const accountRegistrationRepository =
    new DrizzleAccountRegistrationRepository()
  const accountIdGenerator = new UuidV7IdGenerator()
  const oauthConnectionIdGenerator = new UuidV7IdGenerator()
  const sessionIdGenerator = new RandomSessionIdGenerator()
  const sessionStore = new RedisSessionStore()

  return new RegisterWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    accountIdGenerator,
    oauthConnectionIdGenerator,
    sessionIdGenerator,
    sessionStore,
  )
}
