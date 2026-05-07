import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import type { HashServicePort } from '../../ports/hash.service.port.js'
import type { PasswordCredentialRepositoryPort } from '../../ports/password-credential.repository.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import { InvalidCredentialsError } from './login.errors.js'
import { type LoginInput, LoginUseCase } from './login.use-case.js'

function makeSut() {
  const user = User.restore({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
  })

  const userRepository: UserRepositoryPort = {
    findByEmail: vi.fn(async () => user),
    findById: vi.fn(),
    save: vi.fn(),
  }

  const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
    findByUserId: vi.fn(async () => ({
      userId: 'user-1',
      passwordHash: 'hashed-password',
    })),
    save: vi.fn(),
  }

  const hashService: HashServicePort = {
    hash: vi.fn(),
    compare: vi.fn(async () => true),
  }

  const sut = new LoginUseCase(
    userRepository,
    passwordCredentialRepository,
    hashService,
  )

  return {
    sut,
    user,
    userRepository,
    passwordCredentialRepository,
    hashService,
  }
}

describe('LoginUseCase', () => {
  it('should login successfully with valid credentials', async () => {
    const { sut, userRepository, passwordCredentialRepository, hashService } =
      makeSut()

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'plain-password',
    }

    const output = await sut.execute(input)

    expect(output).toEqual({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User Example',
      },
    })

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    )
    expect(hashService.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    )
  })

  it('should fail login with invalid password', async () => {
    const { sut, userRepository, passwordCredentialRepository, hashService } =
      makeSut()

    vi.mocked(hashService.compare).mockResolvedValueOnce(false)

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'wrong-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    )
    expect(hashService.compare).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    )
  })

  it('should fail login with unknown email', async () => {
    const { sut, userRepository, passwordCredentialRepository, hashService } =
      makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null)

    const input: LoginInput = {
      email: 'invalid@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'invalid@example.com',
    )
    expect(passwordCredentialRepository.findByUserId).not.toHaveBeenCalled()
    expect(hashService.compare).not.toHaveBeenCalled()
  })

  it('should fail login when password credential is not found', async () => {
    const { sut, userRepository, passwordCredentialRepository, hashService } =
      makeSut()

    vi.mocked(passwordCredentialRepository.findByUserId).mockResolvedValueOnce(
      null,
    )
    const input: LoginInput = {
      email: 'user@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    )
    expect(hashService.compare).not.toHaveBeenCalled()
  })

  it('should normalize email before finding user', async () => {
    const { sut, userRepository } = makeSut()

    const input: LoginInput = {
      email: 'useR@example.COM',
      password: 'plain-password',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
