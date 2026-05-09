import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import { InvalidEmailError } from '../../../domain/user.errors.js'
import type { HasherPort } from '../../ports/hasher.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { RegisterWithPasswordRepositoryPort } from '../../ports/register-with-password.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register-with-password.errors.js'
import {
  type RegisterWithPasswordInput,
  RegisterWithPasswordUseCase,
} from './register-with-password.use-case.js'

function makeSut() {
  const idGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'generated-id'),
  }

  const userRepository: UserRepositoryPort = {
    findByEmail: vi.fn(async () => null),
    findById: vi.fn(),
    save: vi.fn(async () => null),
  }

  const hash: HasherPort = {
    hash: vi.fn(async () => 'hashed-password'),
    compare: vi.fn(),
  }

  const registerWithPasswordRepository: RegisterWithPasswordRepositoryPort = {
    save: vi.fn(async () => null),
  }

  const sut = new RegisterWithPasswordUseCase(
    idGenerator,
    userRepository,
    hash,
    registerWithPasswordRepository,
  )
  return {
    sut,
    idGenerator,
    userRepository,
    hash,
    registerWithPasswordRepository,
  }
}

describe('RegisterWithPasswordUseCase', () => {
  it('should successfully register a new user', async () => {
    const { sut, registerWithPasswordRepository, hash } = makeSut()

    const input: RegisterWithPasswordInput = {
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

    expect(hash.hash).toHaveBeenCalledWith('password123')

    expect(registerWithPasswordRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          id: 'generated-id',
          email: 'user@example.com',
          name: 'User Example',
          createdAt: expect.any(Date),
        }),
        passwordHash: 'hashed-password',
      }),
    )
  })

  it('should fail when email is invalid', async () => {
    const { sut, registerWithPasswordRepository, hash } = makeSut()

    const input: RegisterWithPasswordInput = {
      email: 'wrongexample.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError)

    expect(registerWithPasswordRepository.save).not.toHaveBeenCalled()
    expect(hash.hash).not.toHaveBeenCalled()
  })

  it('should fail when email is already in use', async () => {
    const {
      sut,
      idGenerator,
      userRepository,
      registerWithPasswordRepository,
      hash,
    } = makeSut()

    const existingUser = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    })

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(existingUser)

    const input: RegisterWithPasswordInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyInUseError)
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(hash.hash).not.toHaveBeenCalled()
    expect(registerWithPasswordRepository.save).not.toHaveBeenCalled()
    expect(idGenerator.generate).not.toHaveBeenCalled()
  })

  it('should normalize email before checking if user already exists', async () => {
    const { sut, userRepository } = makeSut()

    const input: RegisterWithPasswordInput = {
      email: 'usEr@EXample.com',
      name: 'User Example',
      password: 'password123',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
