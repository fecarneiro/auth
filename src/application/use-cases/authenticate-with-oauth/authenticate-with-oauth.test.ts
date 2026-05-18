import { describe, expect, it, vi } from 'vitest'
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
import {
  AuthenticateWithOAuthUseCase,
  type AuthenticateWithOAuthUseCaseInput,
} from './authenticate-with-oauth.use-case.js'

const verifiedIdentity: OAuthIdentity = {
  provider: 'google',
  providerUserId: 'google-1',
  email: 'user@example.com',
  emailVerified: true,
  name: 'User Example',
  pictureUrl: null,
}

function makeSut() {
  const oauthConnectionRepository: Pick<
    OAuthConnectionRepositoryPort,
    'findByProviderIdentity'
  > = {
    findByProviderIdentity: vi.fn(async () => null),
  }

  const account = Account.restore({
    id: 'account-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
    passwordHash: null,
    oauthConnections: [{ provider: 'google', providerUserId: 'google-1' }],
  })

  const accountRepository: Pick<
    AccountRepositoryPort,
    'findById' | 'findByEmail'
  > = {
    findById: vi.fn(async () => account),
    findByEmail: vi.fn(async () => null),
  }

  const accountRegistrationRepository: Pick<
    AccountRegistrationRepositoryPort,
    'createWithOAuthConnection'
  > = {
    createWithOAuthConnection: vi.fn(),
  }

  let idCounter = 0
  const idGenerator: IdGeneratorPort = {
    generate: vi.fn(() => `generated-id-${++idCounter}`),
  }

  const sessionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'session-id'),
  }

  const sessionStore: Pick<SessionStorePort, 'create'> = {
    create: vi.fn(),
  }

  const sut = new AuthenticateWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    idGenerator,
    sessionIdGenerator,
    sessionStore,
  )

  return {
    sut,
    account,
    oauthConnectionRepository,
    accountRepository,
    accountRegistrationRepository,
    sessionStore,
  }
}

describe('AuthenticateWithOAuthUseCase', () => {
  it('should log in when the OAuth identity is already connected', async () => {
    const {
      sut,
      oauthConnectionRepository,
      accountRegistrationRepository,
      sessionStore,
    } = makeSut()

    vi.mocked(
      oauthConnectionRepository.findByProviderIdentity,
    ).mockResolvedValueOnce({
      id: 'conn-1',
      accountId: 'account-1',
      provider: 'google',
      providerUserId: 'google-1',
    })

    const input: AuthenticateWithOAuthUseCaseInput = {
      identity: verifiedIdentity,
    }

    const output = await sut.execute(input)

    expect(output).toEqual({
      account: {
        id: 'account-1',
        email: 'user@example.com',
        name: 'User Example',
      },
      sessionId: 'session-id',
    })
    expect(sessionStore.create).toHaveBeenCalledWith({
      id: 'session-id',
      accountId: 'account-1',
    })
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
  })

  it('should fail when the connection points to a missing account', async () => {
    const { sut, oauthConnectionRepository, accountRepository, sessionStore } =
      makeSut()

    vi.mocked(
      oauthConnectionRepository.findByProviderIdentity,
    ).mockResolvedValueOnce({
      id: 'conn-1',
      accountId: 'ghost',
      provider: 'google',
      providerUserId: 'google-1',
    })
    vi.mocked(accountRepository.findById).mockResolvedValueOnce(null)

    await expect(sut.execute({ identity: verifiedIdentity })).rejects.toThrow(
      OAuthLinkedAccountNotFoundError,
    )
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail to register when the provider did not provide an email', async () => {
    const { sut, accountRegistrationRepository, sessionStore } = makeSut()

    await expect(
      sut.execute({ identity: { ...verifiedIdentity, email: null } }),
    ).rejects.toThrow(OAuthEmailNotProvidedError)
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail to register when the provider email is not verified', async () => {
    const { sut, accountRegistrationRepository } = makeSut()

    await expect(
      sut.execute({ identity: { ...verifiedIdentity, emailVerified: false } }),
    ).rejects.toThrow(OAuthEmailNotVerifiedError)
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
  })

  it('should reject (no implicit link) when the email already has an account', async () => {
    const {
      sut,
      account,
      accountRepository,
      accountRegistrationRepository,
      sessionStore,
    } = makeSut()

    vi.mocked(accountRepository.findByEmail).mockResolvedValueOnce(account)

    await expect(sut.execute({ identity: verifiedIdentity })).rejects.toThrow(
      OAuthEmailAlreadyRegisteredError,
    )
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should register a new OAuth-only account on first contact', async () => {
    const { sut, accountRegistrationRepository, sessionStore } = makeSut()

    const output = await sut.execute({ identity: verifiedIdentity })

    expect(output).toEqual({
      account: {
        id: 'generated-id-1',
        email: 'user@example.com',
        name: 'User Example',
      },
      sessionId: 'session-id',
    })
    expect(
      accountRegistrationRepository.createWithOAuthConnection,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          id: 'generated-id-1',
          email: 'user@example.com',
          passwordHash: null,
        }),
        oauthConnection: {
          id: 'generated-id-2',
          accountId: 'generated-id-1',
          provider: 'google',
          providerUserId: 'google-1',
        },
      }),
    )
    expect(sessionStore.create).toHaveBeenCalledWith({
      id: 'session-id',
      accountId: 'generated-id-1',
    })
  })
})
