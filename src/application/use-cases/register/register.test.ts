import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import { InvalidEmailError } from '../../../domain/user.errors.js'
import type { HasherPort } from '../../ports/hasher.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { RegisterRepositoryPort } from '../../ports/register.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { EmailAlreadyInUseError } from './register.errors.js'
import { type RegisterInput, RegisterUseCase } from './register.use-case.js'

function makeSut() {
  const idGenerator: Pick<IdGeneratorPort, 'generate'> = {
    generate: vi.fn(() => 'generated-id'),
  }

  const userRepository: Pick<UserRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => null),
  }

  const hash: Pick<HasherPort, 'hash'> = {
    hash: vi.fn(async () => 'hashed-password'),
  }

  const RegisterRepository: Pick<RegisterRepositoryPort, 'save'> = {
    save: vi.fn(),
  }

  const sut = new RegisterUseCase(
    idGenerator,
    userRepository,
    hash,
    RegisterRepository,
  )
  return {
    sut,
    idGenerator,
    userRepository,
    hash,
    RegisterRepository,
  }
}

describe('RegisterUseCase', () => {
  it('should successfully register a new user', async () => {
    const { sut, RegisterRepository, hash } = makeSut()

    const input: RegisterInput = {
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

    expect(RegisterRepository.save).toHaveBeenCalledWith(
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
    const { sut, RegisterRepository, hash } = makeSut()

    const input: RegisterInput = {
      email: 'wrongexample.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidEmailError)

    expect(RegisterRepository.save).not.toHaveBeenCalled()
    expect(hash.hash).not.toHaveBeenCalled()
  })

  it('should fail when email is already in use', async () => {
    const { sut, idGenerator, userRepository, RegisterRepository, hash } =
      makeSut()

    const existingUser = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    })

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(existingUser)

    const input: RegisterInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    }

    await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyInUseError)
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(hash.hash).not.toHaveBeenCalled()
    expect(RegisterRepository.save).not.toHaveBeenCalled()
    expect(idGenerator.generate).not.toHaveBeenCalled()
  })

  it('should normalize email before checking if user already exists', async () => {
    const { sut, userRepository } = makeSut()

    const input: RegisterInput = {
      email: 'usEr@EXample.com',
      name: 'User Example',
      password: 'password123',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
