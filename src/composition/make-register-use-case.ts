import { RegisterUseCase } from '../application/use-cases/register/register.use-case.js'
import { BcryptHasher } from '../infrastructure/crypto/bcrypt-hasher.js'
import { UuidV7EntityIdGenerator } from '../infrastructure/crypto/uuid-v7-entity-id-generator copy.js'
import { DrizzleRegisterRepository } from '../infrastructure/database/repository/drizzle-register.repository.js'
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js'

export function makeRegisterUseCase() {
  const idGenerator = new UuidV7EntityIdGenerator()
  const userRepository = new DrizzleUserRepository()
  const hash = new BcryptHasher()
  const registerRepository = new DrizzleRegisterRepository()

  return new RegisterUseCase(
    idGenerator,
    userRepository,
    hash,
    registerRepository,
  )
}
