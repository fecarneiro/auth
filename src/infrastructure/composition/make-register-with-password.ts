import { RegisterWithPasswordUseCase } from '../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { BcryptPasswordHasher } from '../crypto/bcrypt-password-hasher.js'
import { UuidV7IdGenerator } from '../crypto/uuid-v7-id-generator.js'
import { DrizzleUserRepository } from '../database/repositories/drizzle-user.repository.js'
import { DrizzleUserRegistrationRepository } from '../database/repositories/drizzle-user-registration.repository.js'

export function makeRegisterWithPasswordUseCase() {
  const idGenerator = new UuidV7IdGenerator()
  const userRepository = new DrizzleUserRepository()
  const hash = new BcryptPasswordHasher()
  const registerRepository = new DrizzleUserRegistrationRepository()

  return new RegisterWithPasswordUseCase(
    idGenerator,
    userRepository,
    hash,
    registerRepository,
  )
}
