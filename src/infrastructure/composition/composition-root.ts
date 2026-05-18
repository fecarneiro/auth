import { AuthenticateWithOAuthUseCase } from '../../application/use-cases/authenticate-with-oauth/authenticate-with-oauth.use-case.js'
import { GetAuthenticatedAccountUseCase } from '../../application/use-cases/get-authenticated-account/get-authenticated-account.use-case.js'
import { LinkOAuthProviderUseCase } from '../../application/use-cases/link-oauth-provider/link-oauth-provider.use-case.js'
import { LoginWithPasswordUseCase } from '../../application/use-cases/login-with-password/login-with-password.use-case.js'
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case.js'
import { RegisterWithPasswordUseCase } from '../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { BcryptPasswordHasher } from '../crypto/bcrypt-password-hasher.js'
import { RandomSessionIdGenerator } from '../crypto/random-session-id-generator.js'
import { UuidV7IdGenerator } from '../crypto/uuid-v7-id-generator.js'
import { DrizzleAccountRepository } from '../database/repositories/drizzle-account.repository.js'
import { DrizzleAccountRegistrationRepository } from '../database/repositories/drizzle-account-registration.repository.js'
import { DrizzleOAuthConnectionRepository } from '../database/repositories/drizzle-oauth-connection.repository.js'
import { RedisSessionStore } from '../session/redis-session-store.js'

const accountRepository = new DrizzleAccountRepository()
const accountRegistrationRepository = new DrizzleAccountRegistrationRepository()
const oauthConnectionRepository = new DrizzleOAuthConnectionRepository()
const passwordHasher = new BcryptPasswordHasher()
const entityIdGenerator = new UuidV7IdGenerator()
const sessionIdGenerator = new RandomSessionIdGenerator()
const sessionStore = new RedisSessionStore()

export const compositionRoot = {
  sessionStore,
  loginWithPasswordUseCase: new LoginWithPasswordUseCase(
    accountRepository,
    passwordHasher,
    sessionIdGenerator,
    sessionStore,
  ),
  registerWithPasswordUseCase: new RegisterWithPasswordUseCase(
    entityIdGenerator,
    accountRepository,
    passwordHasher,
    accountRegistrationRepository,
  ),
  logoutUseCase: new LogoutUseCase(sessionStore),
  authenticateWithOAuthUseCase: new AuthenticateWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    entityIdGenerator,
    sessionIdGenerator,
    sessionStore,
  ),
  linkOAuthProviderUseCase: new LinkOAuthProviderUseCase(
    oauthConnectionRepository,
    accountRepository,
    entityIdGenerator,
  ),
  getAuthenticatedAccountUseCase: new GetAuthenticatedAccountUseCase(
    accountRepository,
  ),
} as const
