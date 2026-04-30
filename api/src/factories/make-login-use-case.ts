import { LoginUseCase } from '../application/login.use-case.js';
import { BcryptHashService } from '../infrastructure/crypto/bcrypt-hash.service.js';
import { DrizzlePasswordCredentialRepository } from '../infrastructure/database/drizzle-password-credential.repository.js';
import { DrizzleUserRepository } from '../infrastructure/database/drizzle-user.repository.js';

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository();
  const passwordCredentialRepository =
    new DrizzlePasswordCredentialRepository();
  const hashService = new BcryptHashService();

  return new LoginUseCase(
    userRepository,
    passwordCredentialRepository,
    hashService,
  );
}
