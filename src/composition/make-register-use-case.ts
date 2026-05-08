import { RegisterUserWithPasswordUseCase } from '../application/use-cases/register-user/register-user.use-case.js'
import { BcryptHashService } from '../infrastructure/crypto/bcrypt-hash.service.js'
import { UuidV7IdGenerator } from '../infrastructure/crypto/uuid-v7-id-generator.js'
import { DrizzlepasswordRepository } from '../infrastructure/database/repository/drizzle-password.repository.js'
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js'

export function makeRegisterUserWithPasswordUseCase() {
  const idGenerator = new UuidV7IdGenerator()
  const userRepository = new DrizzleUserRepository()
  const hashService = new BcryptHashService()
  const passwordRepository = new DrizzlepasswordRepository()

  return new RegisterUserWithPasswordUseCase(
    idGenerator,
    userRepository,
    hashService,
    passwordRepository,
  )
}
