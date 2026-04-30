import { describe, expect, it, vi } from 'vitest';
import type { HashServicePort } from '../../ports/hash.service.port.js';
import type { IdGeneratorPort } from '../../ports/id-generator.port.js';
import type { PasswordCredentialRepositoryPort } from '../../ports/password-credential.repository.port.js';
import type { UserRepositoryPort } from '../../ports/user.repository.port.js';
import {
  type RegisterUserInput,
  RegisterUserUseCase,
} from './register-user.use-case.js';

describe('RegisterUserUseCase', () => {
  it('should successfully register a new user', async () => {
    const input: RegisterUserInput = {
      email: 'user@example.com',
      name: 'User Example',
      password: 'password123',
    };

    const idGenerator: IdGeneratorPort = {
      generate: vi.fn(() => 'generated-id'),
    };

    const userRepository: UserRepositoryPort = {
      findByEmail: vi.fn(async () => null),
      findById: vi.fn(),
      save: vi.fn(async () => {}),
    };

    const hashService: HashServicePort = {
      hash: vi.fn(async () => 'hashed-password'),
      compare: vi.fn(),
    };

    const passwordCredentialRepository: PasswordCredentialRepositoryPort = {
      findByUserId: vi.fn(),
      save: vi.fn(async () => {}),
    };

    const registerUserUseCase = new RegisterUserUseCase(
      idGenerator,
      userRepository,
      hashService,
      passwordCredentialRepository,
    );

    await registerUserUseCase.execute(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(idGenerator.generate).toHaveBeenCalled();
    expect(hashService.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-id',
        email: 'user@example.com',
        name: 'User Example',
      }),
    );
    expect(passwordCredentialRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'generated-id',
        passwordHash: 'hashed-password',
      }),
    );
  });
});
