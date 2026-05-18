import { Account } from '../../../domain/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { AccountRegistrationRepositoryPort } from '../../ports/account/account-registration.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { OAuthIdentity } from '../../ports/oauth/oauth-identity.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  OAuthConnectionAlreadyExistsError,
  OAuthEmailNotProvidedError,
  OAuthEmailNotVerifiedError,
} from './register-with-oauth.errors.js'

export interface RegisterWithOAuthUseCaseInput {
  identity: OAuthIdentity
}

export interface RegisterWithOAuthUseCaseOutput {
  account: {
    id: string
    email: string
    name: string
  }
  sessionId: string
}

export class RegisterWithOAuthUseCase {
  constructor(
    private readonly oauthConnectionRepository: OAuthConnectionRepositoryPort,
    private readonly accountRepository: Pick<
      AccountRepositoryPort,
      'findByEmail'
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
    input: RegisterWithOAuthUseCaseInput,
  ): Promise<RegisterWithOAuthUseCaseOutput> {
    const { provider, providerUserId, email, emailVerified } = input.identity

    const oauthConnection =
      await this.oauthConnectionRepository.findByProviderIdentity({
        provider,
        providerUserId,
      })

    if (oauthConnection) {
      throw new OAuthConnectionAlreadyExistsError()
    }

    if (!email) {
      throw new OAuthEmailNotProvidedError()
    }

    if (emailVerified !== true) {
      throw new OAuthEmailNotVerifiedError()
    }

    const existingAccount = await this.accountRepository.findByEmail(email)

    if (existingAccount) {
      existingAccount.linkOAuth({ provider, providerUserId })

      const snapshot = existingAccount.snapshot()
      const sessionId = this.sessionIdGenerator.generate()

      await this.oauthConnectionRepository.save({
        id: this.idGenerator.generate(),
        accountId: snapshot.id,
        provider,
        providerUserId,
      })

      await this.sessionStore.create({
        id: sessionId,
        accountId: snapshot.id,
      })

      return {
        account: {
          id: snapshot.id,
          email: snapshot.email,
          name: snapshot.name,
        },
        sessionId,
      }
    }

    const account = Account.registerWithOAuth({
      id: this.idGenerator.generate(),
      email,
      name: input.identity.name ?? email,
      oauthConnection: {
        provider,
        providerUserId,
      },
      createdAt: new Date(),
    })

    const snapshot = account.snapshot()
    const sessionId = this.sessionIdGenerator.generate()

    await this.accountRegistrationRepository.createWithOAuthConnection({
      account: snapshot,
      oauthConnection: {
        id: this.idGenerator.generate(),
        accountId: snapshot.id,
        provider,
        providerUserId,
      },
    })

    await this.sessionStore.create({
      id: sessionId,
      accountId: snapshot.id,
    })

    return {
      account: {
        id: snapshot.id,
        email: snapshot.email,
        name: snapshot.name,
      },
      sessionId,
    }
  }
}
