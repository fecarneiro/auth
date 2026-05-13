import { RegisterUseCase } from '../../application/use-cases/register/register.use-case.js'
import { BcryptHasher } from '../crypto/bcrypt-hasher.js'
import { UuidV7EntityIdGenerator } from '../crypto/uuid-v7-entity-id-generator copy.js'
import { DrizzleRegisterRepository } from '../database/repository/drizzle-register.repository.js'
import { DrizzleUserRepository } from '../database/repository/drizzle-user.repository.js'

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
