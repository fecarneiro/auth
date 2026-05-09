import { LoginUseCase } from '../application/use-cases/login/login.use-case.js'
import { BcryptHasher } from '../infrastructure/crypto/bcrypt-hasher.js'
import { DrizzlepasswordRepository } from '../infrastructure/database/repository/drizzle-password.repository.js'
import { DrizzleUserRepository } from '../infrastructure/database/repository/drizzle-user.repository.js'

export function makeLoginUseCase() {
  const userRepository = new DrizzleUserRepository()
  const passwordRepository = new DrizzlepasswordRepository()
  const hash = new BcryptHasher()

  return new LoginUseCase(userRepository, passwordRepository, hash)
}
