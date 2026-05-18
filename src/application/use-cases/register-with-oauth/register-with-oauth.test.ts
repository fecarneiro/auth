import { describe, expect, it, vi } from 'vitest'
import { Account } from '../../../domain/account/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { AccountRegistrationRepositoryPort } from '../../ports/account/account-registration.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  OAuthConnectionAlreadyExistsError,
  OAuthEmailNotProvidedError,
  OAuthEmailNotVerifiedError,
} from './register-with-oauth.errors.js'
import {
  RegisterWithOAuthUseCase,
  type RegisterWithOAuthUseCaseInput,
} from './register-with-oauth.use-case.js'

function makeSut() {
  const oauthConnectionRepository: OAuthConnectionRepositoryPort = {
    save: vi.fn(),
    findByProviderIdentity: vi.fn(async () => null),
  }

  const accountRepository: Pick<AccountRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => null),
  }

  const accountRegistrationRepository: Pick<
    AccountRegistrationRepositoryPort,
    'createWithOAuthConnection'
  > = {
    createWithOAuthConnection: vi.fn(),
  }

  const accountIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'account-1'),
  }

  const oauthConnectionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'oauth-connection-1'),
  }

  const sessionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'session-1'),
  }

  const sessionStore: Pick<SessionStorePort, 'create'> = {
    create: vi.fn(),
  }

  const sut = new RegisterWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    accountIdGenerator,
    oauthConnectionIdGenerator,
    sessionIdGenerator,
    sessionStore,
  )

  return {
    sut,
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    accountIdGenerator,
    oauthConnectionIdGenerator,
    sessionStore,
  }
}

describe('RegisterWithOAuthUseCase', () => {
  const input: RegisterWithOAuthUseCaseInput = {
    identity: {
      provider: 'google',
      providerUserId: 'google-user-1',
      email: 'user@example.com',
      emailVerified: true,
      name: 'User Example',
      pictureUrl: null,
    },
  }

  it('should create an OAuth-only account when email is new', async () => {
    const {
      sut,
      accountRegistrationRepository,
      oauthConnectionRepository,
      sessionStore,
    } = makeSut()

    const output = await sut.execute(input)

    expect(oauthConnectionRepository.save).not.toHaveBeenCalled()
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).toHaveBeenCalledWith({
      account: expect.objectContaining({
        id: 'account-1',
        email: 'user@example.com',
        name: 'User Example',
        passwordHash: null,
        oauthConnections: [
          {
            provider: 'google',
            providerUserId: 'google-user-1',
          },
        ],
        createdAt: expect.any(Date),
      }),
      oauthConnection: {
        id: 'oauth-connection-1',
        accountId: 'account-1',
        provider: 'google',
        providerUserId: 'google-user-1',
      },
    })
    expect(sessionStore.create).toHaveBeenCalledWith({
      id: 'session-1',
      accountId: 'account-1',
    })
    expect(output).toEqual({
      account: {
        id: 'account-1',
        email: 'user@example.com',
        name: 'User Example',
      },
      sessionId: 'session-1',
    })
  })

  it('should link OAuth connection to an existing account with same verified email', async () => {
    const {
      sut,
      accountRepository,
      accountRegistrationRepository,
      oauthConnectionRepository,
      accountIdGenerator,
      sessionStore,
    } = makeSut()

    const existingAccount = Account.restore({
      id: 'account-existing',
      email: 'user@example.com',
      name: 'Existing Account',
      createdAt: new Date('2026-01-01'),
      passwordHash: 'hashed-password',
      oauthConnections: [],
    })

    vi.mocked(accountRepository.findByEmail).mockResolvedValueOnce(
      existingAccount,
    )

    const output = await sut.execute(input)

    expect(accountIdGenerator.generate).not.toHaveBeenCalled()
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
    expect(oauthConnectionRepository.save).toHaveBeenCalledWith({
      id: 'oauth-connection-1',
      accountId: 'account-existing',
      provider: 'google',
      providerUserId: 'google-user-1',
    })
    expect(sessionStore.create).toHaveBeenCalledWith({
      id: 'session-1',
      accountId: 'account-existing',
    })
    expect(output).toEqual({
      account: {
        id: 'account-existing',
        email: 'user@example.com',
        name: 'Existing Account',
      },
      sessionId: 'session-1',
    })
  })

  it('should fail when OAuth connection already exists', async () => {
    const {
      sut,
      oauthConnectionRepository,
      accountRepository,
      accountRegistrationRepository,
      sessionStore,
    } = makeSut()

    vi.mocked(
      oauthConnectionRepository.findByProviderIdentity,
    ).mockResolvedValueOnce({
      id: 'oauth-connection-1',
      accountId: 'account-1',
      provider: 'google',
      providerUserId: 'google-user-1',
    })

    await expect(sut.execute(input)).rejects.toThrow(
      OAuthConnectionAlreadyExistsError,
    )
    expect(accountRepository.findByEmail).not.toHaveBeenCalled()
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail when provider does not return email', async () => {
    const { sut, accountRepository, sessionStore } = makeSut()

    await expect(
      sut.execute({
        identity: {
          ...input.identity,
          email: null,
        },
      }),
    ).rejects.toThrow(OAuthEmailNotProvidedError)
    expect(accountRepository.findByEmail).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail when provider email is not verified', async () => {
    const { sut, accountRepository, sessionStore } = makeSut()

    await expect(
      sut.execute({
        identity: {
          ...input.identity,
          emailVerified: false,
        },
      }),
    ).rejects.toThrow(OAuthEmailNotVerifiedError)
    expect(accountRepository.findByEmail).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })
})
