import { describe, expect, it, vi } from 'vitest'
import { User } from '../../../domain/user.entity.js'
import { type LoginInput, LoginUseCase } from './login.use-case.js'
import { InvalidCredentialsError } from './login-use-case.errors.js'

function makeSut() {
  const user = User.restore({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User Example',
    createdAt: new Date('2026-01-01'),
  })

  const userRepository = {
    findByEmail: vi.fn(async () => user),
  }

  const passwordRepository = {
    findByUserId: vi.fn(async () => ({
      userId: 'user-1',
      passwordHash: 'hashed-password',
    })),
  }

  const hash = {
    compare: vi.fn(async () => true),
  }

  const sessionStore = {
    set: vi.fn(async () => 'session-abc'),
  }

  const sut = new LoginUseCase(
    userRepository,
    passwordRepository,
    hash,
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
      sessionId: 'session-abc',
    })

    expect(sessionStore.set).toHaveBeenCalledWith({ userId: 'user-1' })
  })

  it('should fail login with invalid password', async () => {
    const { sut, hash, sessionStore } = makeSut()

    vi.mocked(hash.compare).mockResolvedValueOnce(false)

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'wrong-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(sessionStore.set).not.toHaveBeenCalled()
  })

  it('should fail login with unknown email', async () => {
    const { sut, userRepository, passwordRepository, hash, sessionStore } =
      makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null)

    const input: LoginInput = {
      email: 'invalid@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)
    expect(sessionStore.set).not.toHaveBeenCalled()
    expect(passwordRepository.findByUserId).not.toHaveBeenCalled()
    expect(hash.compare).not.toHaveBeenCalled()
  })

  it('should fail login when password credential is not found', async () => {
    const { sut, userRepository, passwordRepository, hash, sessionStore } =
      makeSut()

    vi.mocked(passwordRepository.findByUserId).mockResolvedValueOnce(null)
    const input: LoginInput = {
      email: 'user@example.com',
      password: 'plain-password',
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError)

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(passwordRepository.findByUserId).toHaveBeenCalledWith('user-1')
    expect(hash.compare).not.toHaveBeenCalled()
    expect(sessionStore.set).not.toHaveBeenCalled()
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
