import { LoginWithOAuthUseCase } from '../../application/use-cases/login-with-oauth/login-with-oauth.use-case.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { DrizzleAccountRepository } from '../database/repositories/drizzle-account.repository.js'
import { DrizzleOAuthConnectionRepository } from '../database/repositories/drizzle-oauth-connection.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

export function makeLoginWithOAuthUseCase() {
  const oauthConnectionRepository = new DrizzleOAuthConnectionRepository()
  const accountRepository = new DrizzleAccountRepository()
  const sessionIdGenerator = new RandomSessionIdGenerator()
  const sessionStore = new RedisSessionStore()

  return new LoginWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    sessionIdGenerator,
    sessionStore,
  )
}
