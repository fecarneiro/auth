import { RegisterUserUseCase } from '../application/use-cases/register-user/register-user.use-case.js';
import { BcryptHashService } from '../infrastructure/crypto/bcrypt-hash.service.js';
import { UuidV7IdGenerator } from '../infrastructure/crypto/uuid-v7-id-generator.js';
import { DrizzlePasswordCredentialRepository } from '../infrastructure/database/repository/drizzle-password-credential.repository.js';
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js';

export function makeRegisterUserUseCase() {
  const idGenerator = new UuidV7IdGenerator();
  const userRepository = new DrizzleUserRepository();
  const hashService = new BcryptHashService();
  const passwordCredentialRepository = new DrizzlePasswordCredentialRepository();

  return new RegisterUserUseCase(
    idGenerator,
    userRepository,
    hashService,
    passwordCredentialRepository,
  );
}
