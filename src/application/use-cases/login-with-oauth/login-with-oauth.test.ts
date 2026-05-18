import { describe, expect, it, vi } from 'vitest'
import { Account } from '../../../domain/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type {
  OAuthConnectionRecord,
  OAuthConnectionRepositoryPort,
} from '../../ports/oauth/oauth-connection.repository.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  OAuthConnectionNotFoundError,
  OAuthLinkedAccountNotFoundError,
} from './login-with-oauth.errors.js'
import {
  LoginWithOAuthUseCase,
  type LoginWithOAuthUseCaseInput,
} from './login-with-oauth.use-case.js'

function makeSut() {
  const account = Account.restore({
    id: 'account-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
    passwordHash: null,
    oauthConnections: [
      {
        provider: 'google',
        providerUserId: 'google-user-1',
      },
    ],
  })

  const oauthConnectionRepository: OAuthConnectionRepositoryPort = {
    save: vi.fn(),
    findByProviderIdentity: vi.fn(
      async (): Promise<OAuthConnectionRecord> => ({
        id: 'oauth-connection-1',
        accountId: 'account-1',
        provider: 'google',
        providerUserId: 'google-user-1',
      }),
    ),
  }

  const accountRepository: Pick<AccountRepositoryPort, 'findById'> = {
    findById: vi.fn(async () => account),
  }

  const sessionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'session-1'),
  }

  const sessionStore: Pick<SessionStorePort, 'create'> = {
    create: vi.fn(),
  }

  const sut = new LoginWithOAuthUseCase(
    oauthConnectionRepository,
    accountRepository,
    sessionIdGenerator,
    sessionStore,
  )

  return {
    sut,
    oauthConnectionRepository,
    accountRepository,
    sessionStore,
  }
}

describe('LoginWithOAuthUseCase', () => {
  const input: LoginWithOAuthUseCaseInput = {
    identity: {
      provider: 'google',
      providerUserId: 'google-user-1',
      email: null,
      emailVerified: null,
      name: null,
      pictureUrl: null,
    },
  }

  it('should login when OAuth connection already exists', async () => {
    const { sut, oauthConnectionRepository, sessionStore } = makeSut()

    const output = await sut.execute(input)

    expect(
      oauthConnectionRepository.findByProviderIdentity,
    ).toHaveBeenCalledWith({
      provider: 'google',
      providerUserId: 'google-user-1',
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

  it('should fail when OAuth connection does not exist', async () => {
    const { sut, oauthConnectionRepository, accountRepository, sessionStore } =
      makeSut()

    vi.mocked(
      oauthConnectionRepository.findByProviderIdentity,
    ).mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(
      OAuthConnectionNotFoundError,
    )
    expect(accountRepository.findById).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail when linked account does not exist', async () => {
    const { sut, accountRepository, sessionStore } = makeSut()

    vi.mocked(accountRepository.findById).mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(
      OAuthLinkedAccountNotFoundError,
    )
    expect(sessionStore.create).not.toHaveBeenCalled()
  })
})
