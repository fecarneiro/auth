import type { OAuthAccountRepositoryPort } from '../../ports/oauth/oauth-account.repository.port.js'
import type { OAuthClientPort } from '../../ports/oauth/oauth-client.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import type { UserRepositoryPort } from '../../ports/user/user.repository.port.js'
import {
  OAuthEmailNotProvidedError,
  OAuthEmailNotVerifiedError,
  OAuthLinkedUserNotFoundError,
} from './login-with-oauth.errors.js'

export interface LoginWithOAuthUseCaseInput {
  code: string
  codeVerifier: string
}

export interface LoginWithOAuthUseCaseOutput {
  user: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class LoginWithOAuthUseCase {
  constructor(
    readonly oauthClientPort: OAuthClientPort,
    readonly oauthAccountRepository: OAuthAccountRepositoryPort,
    readonly userRepository: Pick<
      UserRepositoryPort,
      'findByEmail' | 'findById'
    >,
    private readonly sessionIdGenerator: IdGeneratorPort,

    readonly sessionStore: Pick<SessionStorePort, 'create'>,
  ) {}

  async execute(
    input: LoginWithOAuthUseCaseInput,
  ): Promise<LoginWithOAuthUseCaseOutput> {
    const oauthIdentity =
      await this.oauthClientPort.getIdentityFromAuthorizationCode(input)

    const { provider, providerUserId, email, emailVerified } = oauthIdentity

    const oauthAccount =
      await this.oauthAccountRepository.findByProviderIdentity({
        provider,
        providerUserId,
      })

    if (oauthAccount) {
      const { userId } = oauthAccount

      const user = await this.userRepository.findById(userId)

      if (!user) {
        throw new OAuthLinkedUserNotFoundError()
      }

      const sessionId = this.sessionIdGenerator.generate()

      await this.sessionStore.create({
        id: sessionId,
        userId,
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        sessionId: sessionId,
      }
    }

    if (!email) {
      throw new OAuthEmailNotProvidedError()
    }

    if (emailVerified !== true) {
      throw new OAuthEmailNotVerifiedError()
    }

    // Do not existis

    /**
     * 2. Busca conta OAuth por provider + providerUserId
     * 3. Se existir:
     *    - cria sessão
     *    - retorna usuário/sessão
     * 4. Se não existir:
     *    - exige email verificado
     *    - busca usuário por email
     *    - se não existir, cria usuário
     *    - cria vínculo OAuth
     *    - cria sessão
     */
    throw new Error('Login with OAuth is not implemented yet')
  }
}
