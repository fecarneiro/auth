import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { OAuthIdentity } from '../../ports/oauth/oauth-identity.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  LinkAccountNotFoundError,
  OAuthConnectionAlreadyExistsError,
} from './link-oauth-provider.errors.js'

export interface LinkOAuthProviderUseCaseInput {
  accountId: string
  identity: OAuthIdentity
}

export interface LinkOAuthProviderUseCaseOutput {
  account: {
    id: string
    email: string
    name: string
  }
}

export class LinkOAuthProviderUseCase {
  constructor(
    private readonly oauthConnectionRepository: Pick<
      OAuthConnectionRepositoryPort,
      'findByProviderIdentity' | 'save'
    >,
    private readonly accountRepository: Pick<AccountRepositoryPort, 'findById'>,
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(
    input: LinkOAuthProviderUseCaseInput,
  ): Promise<LinkOAuthProviderUseCaseOutput> {
    const { provider, providerUserId } = input.identity

    const connection =
      await this.oauthConnectionRepository.findByProviderIdentity({
        provider,
        providerUserId,
      })

    if (connection && connection.accountId !== input.accountId) {
      throw new OAuthConnectionAlreadyExistsError()
    }

    const account = await this.accountRepository.findById(input.accountId)

    if (!account) {
      throw new LinkAccountNotFoundError()
    }

    account.linkOAuth({ provider, providerUserId })

    const snapshot = account.snapshot()

    await this.oauthConnectionRepository.save({
      id: this.idGenerator.generate(),
      accountId: snapshot.id,
      provider,
      providerUserId,
    })

    return {
      account: {
        id: snapshot.id,
        email: snapshot.email,
        name: snapshot.name,
      },
    }
  }
}
