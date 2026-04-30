import { describe, expect, it, vi } from 'vitest';
import { User } from '../domain/user.entity.js';
import { InvalidCredentialsError } from './login.errors.js';
import {
  type LoginInput,
  type LoginOutput,
  LoginUseCase,
} from './login.use-case.js';
import type { HashServicePort } from './ports/hash.service.port.js';
import type { PasswordCredentialRepositoryPort } from './ports/password-credential.repository.port.js';
import type { UserRepositoryPort } from './ports/user.repository.port.js';

describe('LoginUseCase', () => {
  it('should login successfully with valid credentials', async () => {
    const user = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    });

    const userRepository: UserRepositoryPort = {
      findByEmail: vi.fn(async () => user),
      findById: vi.fn(),
      save: vi.fn(),
    };

    const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn(async () => ({
        userId: 'user-1',
        passwordHash: 'hashed-password',
      })),
      save: vi.fn(),
    };

    const hashService: HashServicePort = {
      hash: vi.fn(),
      compare: vi.fn(async () => true),
    };

    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordCredentialRepository,
      hashService,
    );

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'plain-password',
    };

    const expectedOutput: LoginOutput = {
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User Example',
      },
    };

    const result = await loginUseCase.execute(input);

    expect(result).toEqual(expectedOutput);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(hashService.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
  });

  it('should fail login with invalid password', async () => {
    const user = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    });

    const userRepository: UserRepositoryPort = {
      findByEmail: vi.fn(async () => user),
      findById: vi.fn(),
      save: vi.fn(),
    };

    const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn(async () => ({
        userId: 'user-1',
        passwordHash: 'hashed-password',
      })),
      save: vi.fn(),
    };

    const hashService: HashServicePort = {
      compare: vi.fn(async () => false),
      hash: vi.fn(),
    };

    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordCredentialRepository,
      hashService,
    );

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'wrong-password',
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(hashService.compare).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    );
  });

  it('should fail login with unknown email', async () => {
    const userRepository: UserRepositoryPort = {
      findByEmail: vi.fn(async () => null),
      findById: vi.fn(),
      save: vi.fn(),
    };

    const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn(),
      save: vi.fn(),
    };

    const hashService: HashServicePort = {
      compare: vi.fn(),
      hash: vi.fn(),
    };

    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordCredentialRepository,
      hashService,
    );

    const input: LoginInput = {
      email: 'invalid@example.com',
      password: 'plain-password',
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'invalid@example.com',
    );
    expect(passwordCredentialRepository.findByUserId).not.toHaveBeenCalled();
    expect(hashService.compare).not.toHaveBeenCalled();
  });

  it('should fail login when password credential is not found', async () => {
    const user = User.restore({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User Example',
      createdAt: new Date('2026-01-01'),
    });

    const userRepository: UserRepositoryPort = {
      findByEmail: vi.fn(async () => user),
      findById: vi.fn(),
      save: vi.fn(),
    };

    const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn(async () => null),
      save: vi.fn(),
    };

    const hashService: HashServicePort = {
      compare: vi.fn(),
      hash: vi.fn(),
    };

    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordCredentialRepository,
      hashService,
    );

    const input: LoginInput = {
      email: 'user@example.com',
      password: 'plain-password',
    };

    await expect(loginUseCase.execute(input)).rejects.toThrow(
      InvalidCredentialsError,
    );

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(passwordCredentialRepository.findByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(hashService.compare).not.toHaveBeenCalled();
  });
});
