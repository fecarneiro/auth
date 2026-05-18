import { Account } from '../../../domain/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { AccountRegistrationRepositoryPort } from '../../ports/account/account-registration.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { OAuthIdentity } from '../../ports/oauth/oauth-identity.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  OAuthEmailAlreadyRegisteredError,
  OAuthEmailNotProvidedError,
  OAuthEmailNotVerifiedError,
  OAuthLinkedAccountNotFoundError,
} from './authenticate-with-oauth.errors.js'

export interface AuthenticateWithOAuthUseCaseInput {
  identity: OAuthIdentity
}

export interface AuthenticateWithOAuthUseCaseOutput {
  account: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class AuthenticateWithOAuthUseCase {
  constructor(
    private readonly oauthConnectionRepository: Pick<
      OAuthConnectionRepositoryPort,
      'findByProviderIdentity'
    >,
    private readonly accountRepository: Pick<
      AccountRepositoryPort,
      'findById' | 'findByEmail'
    >,
    private readonly accountRegistrationRepository: Pick<
      AccountRegistrationRepositoryPort,
      'createWithOAuthConnection'
    >,
    private readonly idGenerator: IdGeneratorPort,
    private readonly sessionIdGenerator: IdGeneratorPort,
    private readonly sessionStore: Pick<SessionStorePort, 'create'>,
  ) {}

  async execute(
    input: AuthenticateWithOAuthUseCaseInput,
  ): Promise<AuthenticateWithOAuthUseCaseOutput> {
    const { provider, providerUserId, email, emailVerified } = input.identity

    const connection =
      await this.oauthConnectionRepository.findByProviderIdentity({
        provider,
        providerUserId,
      })

    if (connection) {
      return this.login(connection.accountId)
    }

    if (!email) {
      throw new OAuthEmailNotProvidedError()
    }

    if (emailVerified !== true) {
      throw new OAuthEmailNotVerifiedError()
    }

    const existingAccount = await this.accountRepository.findByEmail(email)

    if (existingAccount) {
      throw new OAuthEmailAlreadyRegisteredError()
    }

    return this.register({
      email,
      name: input.identity.name ?? email,
      provider,
      providerUserId,
    })
  }

  private async login(
    accountId: string,
  ): Promise<AuthenticateWithOAuthUseCaseOutput> {
    const account = await this.accountRepository.findById(accountId)

    if (!account) {
      throw new OAuthLinkedAccountNotFoundError()
    }

    const snapshot = account.snapshot()

    return this.startSession({
      id: snapshot.id,
      email: snapshot.email,
      name: snapshot.name,
    })
  }

  private async register(input: {
    email: string
    name: string
    provider: OAuthIdentity['provider']
    providerUserId: string
  }): Promise<AuthenticateWithOAuthUseCaseOutput> {
    const account = Account.registerWithOAuth({
      id: this.idGenerator.generate(),
      email: input.email,
      name: input.name,
      oauthConnection: {
        provider: input.provider,
        providerUserId: input.providerUserId,
      },
      createdAt: new Date(),
    })

    const snapshot = account.snapshot()

    await this.accountRegistrationRepository.createWithOAuthConnection({
      account: snapshot,
      oauthConnection: {
        id: this.idGenerator.generate(),
        accountId: snapshot.id,
        provider: input.provider,
        providerUserId: input.providerUserId,
      },
    })

    return this.startSession({
      id: snapshot.id,
      email: snapshot.email,
      name: snapshot.name,
    })
  }

  private async startSession(account: {
    id: string
    email: string
    name: string
  }): Promise<AuthenticateWithOAuthUseCaseOutput> {
    const sessionId = this.sessionIdGenerator.generate()

    await this.sessionStore.create({
      id: sessionId,
      accountId: account.id,
    })

    return { account, sessionId }
  }
}
