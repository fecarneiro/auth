import bcrypt from 'bcrypt'
import type { PasswordHasherPort } from '../../application/ports/password/password-hasher.port.js'

const SALT_ROUNDS = 10

export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
