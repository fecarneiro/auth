import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import { InvalidEmailError } from '../../../domain/user.errors.js'
import type { PasswordHasherPort } from '../../ports/password/password-hasher.port.js'
import type { IdGeneratorPort } from '../../ports/shared/id-generator.port.js'
import type { UserRepositoryPort } from '../../ports/user/user.repository.port.js'
import type { UserRegistrationRepositoryPort } from '../../ports/user/user-registration.repository.port.js'
import { EmailAlreadyInUseError } from './register-with-password.errors.js'
import {
  RegisterWithPasswordUseCase,
  type RegisterWithPasswordUseCaseInput,
} from './register-with-password.use-case.js'

function makeSut() {
  const idGenerator: Pick<IdGeneratorPort, 'generate'> = {
    generate: vi.fn(() => 'generated-id'),
  }

  const userRepository: Pick<UserRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => null),
  }

  const hash: Pick<PasswordHasherPort, 'hash'> = {
    hash: vi.fn(async () => 'hashed-password'),
  }

  const userRegistrationRepository: Pick<
    UserRegistrationRepositoryPort,
    'createWithPassword'
  > = {
    createWithPassword: vi.fn(),
  }

  const sut = new RegisterWithPasswordUseCase(
    idGenerator,
    userRepository,
    hash,
    userRegistrationRepository,
  )
  return {
    sut,
    idGenerator,
    userRepository,
    hash,
    userRegistrationRepository,
  }
}

describe('RegisterWithPasswordUseCase', () => {
  it('should successfully register a new user', async () => {
    const { sut, userRegistrationRepository, hash } = makeSut()

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

    expect(userRegistrationRepository.createWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          id: 'generated-id',
          email: 'user@example.com',
          name: 'User Example',
          createdAt: expect.any(Date),
        }),
        passwordCredential: {
          userId: 'generated-id',
          passwordHash: 'hashed-password',
        },
      }),
    )
  })

  it('should fail when email is invalid', async () => {
    const { sut, userRegistrationRepository, hash } = makeSut()

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'wrongexample.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError)

    expect(userRegistrationRepository.createWithPassword).not.toHaveBeenCalled()
    expect(hash.hash).not.toHaveBeenCalled()
  })

  it('should fail when email is already in use', async () => {
    const {
      sut,
      idGenerator,
      userRepository,
      userRegistrationRepository,
      hash,
    } = makeSut()

    const existingUser = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    })

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(existingUser)

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyInUseError)
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(hash.hash).not.toHaveBeenCalled()
    expect(userRegistrationRepository.createWithPassword).not.toHaveBeenCalled()
    expect(idGenerator.generate).not.toHaveBeenCalled()
  })

  it('should normalize email before checking if user already exists', async () => {
    const { sut, userRepository } = makeSut()

    const input: RegisterWithPasswordUseCaseInput = {
      email: 'usEr@EXample.com',
      name: 'User Example',
      password: 'password123',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
