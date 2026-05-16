import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import type { HasherPort } from '../../ports/hasher.port.js'
import type { IdGeneratorPort } from '../../ports/id-generator.port.js'
import type { SessionStorePort } from '../../ports/session-store.port.js'
import type { UserRepositoryPort } from '../../ports/user.repository.port.js'
import type { UserPasswordRepositoryPort } from '../../ports/user-password.repository.port.js'
import { InvalidCredentialsError } from './login-with-password.errors.js'
import {
  type LoginWithPasswordInput,
  LoginWithPasswordUseCase,
} from './login-with-password.use-case.js'

function makeSut() {
  const user = User.restore({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
  })

  const userRepository: Pick<UserRepositoryPort, 'findByEmail'> = {
    findByEmail: vi.fn(async () => user),
  }

  const passwordRepository: Pick<UserPasswordRepositoryPort, 'findByUserId'> = {
    findByUserId: vi.fn(async () => ({
      userId: 'user-1',
      passwordHash: 'hashed-password',
    })),
  }

  const hash: Pick<HasherPort, 'compare'> = {
    compare: vi.fn(async () => true),
  }

  const randomSessionIdGenerator: IdGeneratorPort = {
    generate: vi.fn(() => 'session-id'),
  }

  const sessionStore: Pick<SessionStorePort, 'create'> = {
    create: vi.fn(),
  }

  const sut = new LoginWithPasswordUseCase(
    userRepository,
    passwordRepository,
    hash,
    randomSessionIdGenerator,
    sessionStore,
  )

  return {
    sut,
    user,
    userRepository,
    passwordRepository,
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
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User Example',
      },
      sessionId: 'session-id',
    })

    expect(sessionStore.create).toHaveBeenCalledWith({
      id: 'session-id',
      userId: 'user-1',
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
    const { sut, userRepository, passwordRepository, hash, sessionStore } =
      makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null)

    const input: LoginWithPasswordInput = {
      email: 'invalid@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(sessionStore.create).not.toHaveBeenCalled()
    expect(passwordRepository.findByUserId).not.toHaveBeenCalled()
    expect(hash.compare).not.toHaveBeenCalled()
  })

  it('should fail login when password credential is not found', async () => {
    const { sut, userRepository, passwordRepository, hash, sessionStore } =
      makeSut()

    vi.mocked(passwordRepository.findByUserId).mockResolvedValueOnce(null)
    const input: LoginWithPasswordInput = {
      email: 'user@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(passwordRepository.findByUserId).toHaveBeenCalledWith('user-1')
    expect(hash.compare).not.toHaveBeenCalled()
    expect(sessionStore.create).not.toHaveBeenCalled()
  })

  it('should normalize email before finding user', async () => {
    const { sut, userRepository } = makeSut()

    const input: LoginWithPasswordInput = {
      email: 'useR@example.COM',
      password: 'plain-password',
    }

    await sut.execute(input)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
  })
})
