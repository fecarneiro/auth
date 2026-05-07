import { LoginUseCase } from '../application/use-cases/login/login.use-case.js';
import { BcryptHashService } from '../infrastructure/crypto/bcrypt-hash.service.js';
import { DrizzlePasswordCredentialRepository } from '../infrastructure/database/repository/drizzle-password-credential.repository.js';
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js';

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository();
  const passwordCredentialRepository = new DrizzlePasswordCredentialRepository();
  const hashService = new BcryptHashService();

  return new LoginUseCase(userRepository, passwordCredentialRepository, hashService);
}
