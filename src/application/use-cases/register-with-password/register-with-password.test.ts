import { describe, expect, it, vi } from 'vitest'
import { Account } from '../../../domain/account/account.entity.js'
import { InvalidEmailError } from '../../../domain/account/account.errors.js'
import type { AccountRepositoryPort } from '../../ports/account/account.repository.port.js'
import type { AccountRegistrationRepositoryPort } from '../../ports/account/account-registration.repository.port.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import { EmailAlreadyInUseError } from './register-with-password.errors.js'
import {
  RegisterWithPasswordUseCase,
  type RegisterWithPasswordUseCaseInput,
} from './register-with-password.use-case.js'

function makeSut() {
  const idGenerator: Pick<IdGeneratorPort, 'generate'> = {
    generate: vi.fn(() => 'generated-id'),
  }

  const accountRepository: Pick<AccountRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => null),
  }

  const hash: Pick<PasswordHasherPort, 'hash'> = {
    hash: vi.fn(async () => 'hashed-password'),
  }

  const accountRegistrationRepository: Pick<
    AccountRegistrationRepositoryPort,
    'createWithPassword'
  > = {
    createWithPassword: vi.fn(),
  }

  const sut = new RegisterWithPasswordUseCase(
    idGenerator,
    accountRepository,
    hash,
    accountRegistrationRepository,
  )
  return {
    sut,
    idGenerator,
    accountRepository,
    hash,
    accountRegistrationRepository,
  }
}

describe('RegisterWithPasswordUseCase', () => {
  it('should successfully register a new account', async () => {
    const { sut, accountRegistrationRepository, hash } = makeSut()

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    const output = await sut.execute(input)

    expect(output).toEqual({
      id: 'generated-id',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: expect.any(Date),
    })

    expect(hash.hash).toHaveBeenCalledWith('password123')

    expect(
      accountRegistrationRepository.createWithPassword,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        account: expect.objectContaining({
          id: 'generated-id',
          email: 'user@example.com',
          name: 'User Example',
          createdAt: expect.any(Date),
          passwordHash: 'hashed-password',
          oauthConnections: [],
        }),
      }),
    )
  })

  it('should fail when email is invalid', async () => {
    const { sut, accountRegistrationRepository, hash } = makeSut()

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'wrongexample.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError)

    expect(
      accountRegistrationRepository.createWithPassword,
    ).not.toHaveBeenCalled()
    expect(hash.hash).not.toHaveBeenCalled()
  })

  it('should fail when email is already in use', async () => {
    const {
      sut,
      idGenerator,
      accountRepository,
      accountRegistrationRepository,
      hash,
    } = makeSut()

    const existingAccount = Account.restore({
      id: 'account-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
      passwordHash: 'hashed-password',
      oauthConnections: [],
    })

    vi.mocked(accountRepository.findByEmail).mockResolvedValueOnce(
      existingAccount,
    )

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyInUseError)
    expect(accountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    )
    expect(hash.hash).not.toHaveBeenCalled()
    expect(
      accountRegistrationRepository.createWithPassword,
    ).not.toHaveBeenCalled()
    expect(idGenerator.generate).not.toHaveBeenCalled()
  })

  it('should normalize email before checking if account already exists', async () => {
    const { sut, accountRepository } = makeSut()

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'usEr@EXample.com',
      name: 'User Example',
      password: 'password123',
    }

    await sut.execute(input)

    expect(accountRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    )
  })
})
