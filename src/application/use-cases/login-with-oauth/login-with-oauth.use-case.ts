import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { OAuthIdentity } from '../../ports/oauth/oauth-identity.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  OAuthConnectionNotFoundError,
  OAuthLinkedAccountNotFoundError,
} from './login-with-oauth.errors.js'

export interface LoginWithOAuthUseCaseInput {
  identity: OAuthIdentity
}

export interface LoginWithOAuthUseCaseOutput {
  account: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class LoginWithOAuthUseCase {
  constructor(
    readonly oauthConnectionRepository: OAuthConnectionRepositoryPort,
    readonly accountRepository: Pick<AccountRepositoryPort, 'findById'>,
    private readonly sessionIdGenerator: IdGeneratorPort,

    readonly sessionStore: Pick<SessionStorePort, 'create'>,
  ) {}

  async execute(
    input: LoginWithOAuthUseCaseInput,
  ): Promise<LoginWithOAuthUseCaseOutput> {
    const { provider, providerUserId } = input.identity

    const oauthConnection =
      await this.oauthConnectionRepository.findByProviderIdentity({
        provider,
        providerUserId,
      })

    if (!oauthConnection) {
      throw new OAuthConnectionNotFoundError()
    }

    const { accountId } = oauthConnection

    const account = await this.accountRepository.findById(accountId)

    if (!account) {
      throw new OAuthLinkedAccountNotFoundError()
    }

    const snapshot = account.snapshot()

    const sessionId = this.sessionIdGenerator.generate()

    await this.sessionStore.create({
      id: sessionId,
      accountId,
    })

    return {
      account: {
        id: snapshot.id,
        email: snapshot.email,
        name: snapshot.name,
      },
      sessionId: sessionId,
    }
  }
}
