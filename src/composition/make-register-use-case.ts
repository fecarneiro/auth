import { RegisterWithPasswordUseCase } from '../application/use-cases/register-with-password/register-with-password.use-case.js'
import { BcryptHashService } from '../infrastructure/crypto/bcrypt-hash.service.js'
import { UuidV7IdGenerator } from '../infrastructure/crypto/uuid-v7-id-generator.js'
import { RegisterWithPasswordRepository } from '../infrastructure/database/repository/drizzle-register-with-password.repository.js'
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js'

export function makeRegisterWithPasswordUseCase() {
  const idGenerator = new UuidV7IdGenerator()
  const userRepository = new DrizzleUserRepository()
  const hashService = new BcryptHashService()
  const registerWithPasswordRepository = new RegisterWithPasswordRepository()

  return new RegisterWithPasswordUseCase(
    idGenerator,
    userRepository,
    hashService,
    registerWithPasswordRepository,
  )
}
