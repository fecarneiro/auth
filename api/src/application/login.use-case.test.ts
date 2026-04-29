import { describe, expect, it, vi } from 'vitest';
import { User } from '../domain/user.entity.js';
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
      findByEmail: vi.fn().mockResolvedValue(user),
      findById: vi.fn(),
    };

    const passwordCredentialsRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn().mockResolvedValue({
        userId: 'user-1',
        passwordHash: 'hashed-password',
      }),
    };

    const hashService: HashServicePort = {
      compare: vi.fn().mockResolvedValue(true),
    };

    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordCredentialsRepository,
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
  });
});
