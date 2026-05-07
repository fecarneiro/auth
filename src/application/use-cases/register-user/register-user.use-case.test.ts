import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import { InvalidEmailError } from '../../../domain/user.errors.js'
import type { HashServicePort } from '../../ports/hash.service.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { PasswordCredentialRepositoryPort } from '../../ports/password-credential.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register-user.errors.js'
import {
  type RegisterUserWithPasswordInput,
  RegisterUserWithPasswordUseCase,
} from './register-user.use-case.js'

function makeSut() {
  const idGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'generated-id'),
  }

  const userRepository: UserRepositoryPort = {
    findByEmail: vi.fn(async () => null),
    findById: vi.fn(),
    save: vi.fn(async () => null),
  }

  const hashService: HashServicePort = {
    hash: vi.fn(async () => 'hashed-password'),
    compare: vi.fn(),
  }

  const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
    findByUserId: vi.fn(),
    save: vi.fn(async () => {}),
  }

  const sut = new RegisterUserWithPasswordUseCase(
    idGenerator,
    userRepository,
    hashService,
    passwordCredentialRepository,
  )
  return {
    sut,
    idGenerator,
    userRepository,
    hashService,
    passwordCredentialRepository,
  }
}

describe('RegisterUserWithPasswordUseCase', () => {
  it('should successfully register a new user', async () => {
    const { sut, userRepository, hashService, passwordCredentialRepository } =
      makeSut()

    const input: RegisterUserWithPasswordInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    const output = await sut.execute(input)

    expect(output).toEqual({
      user: {
        id: 'generated-id',
        email: 'user@example.com',
        name: 'User Example',
        createdAt: expect.any(Date),
      },
    })

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-id',
        email: 'user@example.com',
        name: 'User Example',
        createdAt: expect.any(Date),
      }),
    )

    expect(hashService.hash).toHaveBeenCalledWith('password123')

    expect(passwordCredentialRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'generated-id',
        passwordHash: 'hashed-password',
      }),
    )
  })

  it('should fail when email is invalid', async () => {
    const { sut, userRepository, hashService, passwordCredentialRepository } =
      makeSut()

    const input: RegisterUserWithPasswordInput = {
      email: 'wrongexample.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError)

    expect(userRepository.save).not.toHaveBeenCalled()
    expect(hashService.hash).not.toHaveBeenCalled()
    expect(passwordCredentialRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when email is already in use', async () => {
    const {
      sut,
      idGenerator,
      userRepository,
      hashService,
      passwordCredentialRepository,
    } = makeSut()

    const existingUser = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    })

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(existingUser)

    const input: RegisterUserWithPasswordInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyInUseError)
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(hashService.hash).not.toHaveBeenCalled()
    expect(userRepository.save).not.toHaveBeenCalled()
    expect(passwordCredentialRepository.save).not.toHaveBeenCalled()
    expect(idGenerator.generate).not.toHaveBeenCalled()
  })

  it('should normalize email before checking if user already exists', async () => {
    const { sut, userRepository } = makeSut()

    const input: RegisterUserWithPasswordInput = {
      email: 'usEr@EXample.com',
      name: 'User Example',
      password: 'password123',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
