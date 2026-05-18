import { describe, expect, it, vi } from 'vitest'
import {
  Account,
  type OAuthConnection,
} from '../../../domain/account.entity.js'
import { OAuthProviderAlreadyLinkedError } from '../../../domain/account.errors.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { OAuthConnectionRepositoryPort } from '../../ports/oauth/oauth-connection.repository.port.js'
import type { OAuthIdentity } from '../../ports/oauth/oauth-identity.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import {
  LinkAccountNotFoundError,
  OAuthConnectionAlreadyExistsError,
} from './link-oauth-provider.errors.js'
import {
  LinkOAuthProviderUseCase,
  type LinkOAuthProviderUseCaseInput,
} from './link-oauth-provider.use-case.js'

const identity: OAuthIdentity = {
  provider: 'google',
  providerUserId: 'google-9',
  email: 'different@gmail.com',
  emailVerified: true,
  name: 'From Google',
  pictureUrl: null,
}

function makeSut(oauthConnections: OAuthConnection[] = []) {
  const account = Account.restore({
    id: 'account-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
    passwordHash: 'hashed-password',
    oauthConnections,
  })

  const oauthConnectionRepository: Pick<
    OAuthConnectionRepositoryPort,
    'findByProviderIdentity' | 'save'
  > = {
    findByProviderIdentity: vi.fn(async () => null),
    save: vi.fn(),
  }

  const accountRepository: Pick<AccountRepositoryPort, 'findById'> = {
    findById: vi.fn(async () => account),
  }

  const idGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'connection-id'),
  }

  const sut = new LinkOAuthProviderUseCase(
    oauthConnectionRepository,
    accountRepository,
    idGenerator,
  )

  return { sut, account, oauthConnectionRepository, accountRepository }
}

const input: LinkOAuthProviderUseCaseInput = {
  accountId: 'account-1',
  identity,
}

describe('LinkOAuthProviderUseCase', () => {
  it('should link the provider to the authenticated account', async () => {
    const { sut, oauthConnectionRepository } = makeSut()

    const output = await sut.execute(input)

    expect(output).toEqual({
      account: {
        id: 'account-1',
        email: 'user@example.com',
        name: 'User Example',
      },
    })
    expect(oauthConnectionRepository.save).toHaveBeenCalledWith({
      id: 'connection-id',
      accountId: 'account-1',
      provider: 'google',
      providerUserId: 'google-9',
    })
  })

  it('should fail when the identity is already connected to another account', async () => {
    const { sut, oauthConnectionRepository, accountRepository } = makeSut()

    vi.mocked(
      oauthConnectionRepository.findByProviderIdentity,
    ).mockResolvedValueOnce({
      id: 'conn-1',
      accountId: 'another-account',
      provider: 'google',
      providerUserId: 'google-9',
    })

    await expect(sut.execute(input)).rejects.toThrow(
      OAuthConnectionAlreadyExistsError,
    )
    expect(accountRepository.findById).not.toHaveBeenCalled()
    expect(oauthConnectionRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when the account already has a connection for this provider', async () => {
    const { sut, oauthConnectionRepository } = makeSut([
      { provider: 'google', providerUserId: 'google-old' },
    ])

    await expect(sut.execute(input)).rejects.toThrow(
      OAuthProviderAlreadyLinkedError,
    )
    expect(oauthConnectionRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when the authenticated account no longer exists', async () => {
    const { sut, oauthConnectionRepository, accountRepository } = makeSut()

    vi.mocked(accountRepository.findById).mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(LinkAccountNotFoundError)
    expect(oauthConnectionRepository.save).not.toHaveBeenCalled()
  })
})
