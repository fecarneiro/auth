import { describe, expect, it, vi } from 'vitest'
import { Account } from '../../../domain/account/account.entity.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import { InvalidCredentialsError } from './login-with-password.errors.js'
import {
  type LoginWithPasswordInput,
  LoginWithPasswordUseCase,
} from './login-with-password.use-case.js'

function makeSut() {
  const account = Account.restore({
    id: 'account-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
    passwordHash: 'hashed-password',
    oauthConnections: [],
  })

  const accountRepository: Pick<AccountRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => account),
  }

  const hash: Pick<PasswordHasherPort, 'compare'> = {
    compare: vi.fn(async () => true),
  }

  const randomSessionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'session-id'),
  }

  const sessionStore: Pick<SessionStorePort, 'create'> = {
    create: vi.fn(),
  }

  const sut = new LoginWithPasswordUseCase(
    accountRepository,
    hash,
    randomSessionIdGenerator,
    sessionStore,
  )

  return {
    sut,
    account,
    accountRepository,
    hash,
    sessionStore,
  }
}

describe('LoginUseCase', () => {
  it('should login successfully with valid credentials', async () => {
    const { sut, sessionStore } = makeSut()

    const input: LoginWithPasswordInput = {
      email: 'user@example.com',
      password: 'plain-password',
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
  })

  it('should fail login with invalid password', async () => {
    const { sut, hash, sessionStore } = makeSut()

    vi.mocked(hash.compare).mockResolvedValueOnce(false)

    const input: LoginWithPasswordInput = {
      email: 'user@example.com',
      password: 'wrong-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should fail login with unknown email', async () => {
    const { sut, accountRepository, hash, sessionStore } = makeSut()

    vi.mocked(accountRepository.findByEmail).mockResolvedValueOnce(null)

    const input: LoginWithPasswordInput = {
      email: 'invalid@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(sessionStore.create).not.toHaveBeenCalled()
    expect(hash.compare).not.toHaveBeenCalled()
  })

  it('should fail login when account has no password (OAuth-only)', async () => {
    const { sut, accountRepository, hash, sessionStore } = makeSut()

    const oauthOnlyAccount = Account.restore({
      id: 'account-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
      passwordHash: null,
      oauthConnections: [
        {
          provider: 'google',
          providerUserId: 'google-1',
        },
      ],
    })

    vi.mocked(accountRepository.findByEmail).mockResolvedValueOnce(
      oauthOnlyAccount,
    )

    const input: LoginWithPasswordInput = {
      email: 'user@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(hash.compare).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should normalize email before finding account', async () => {
    const { sut, accountRepository } = makeSut()

    const input: LoginWithPasswordInput = {
      email: 'useR@example.COM',
      password: 'plain-password',
    }

    await sut.execute(input)

    expect(accountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    )
  })
})
