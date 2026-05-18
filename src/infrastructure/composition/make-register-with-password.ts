import { RegisterWithPasswordUseCase } from '../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { BcryptPasswordHasher } from '../crypto/bcrypt-password-hasher.js'
import { UuidV7IdGenerator } from '../crypto/uuid-v7-id-generator.js'
import { DrizzleAccountRepository } from '../database/repositories/drizzle-account.repository.js'
import { DrizzleAccountRegistrationRepository } from '../database/repositories/drizzle-account-registration.repository.js'

export function makeRegisterWithPasswordUseCase() {
  const idGenerator = new UuidV7IdGenerator()
  const accountRepository = new DrizzleAccountRepository()
  const hash = new BcryptPasswordHasher()
  const registerRepository = new DrizzleAccountRegistrationRepository()

  return new RegisterWithPasswordUseCase(
    idGenerator,
    accountRepository,
    hash,
    registerRepository,
  )
}
