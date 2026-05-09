import bcrypt from 'bcrypt'
import type { HasherPort } from '../../application/ports/hasher.port.js'

const SALT_ROUNDS = 10

export class BcryptHasher implements HasherPort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
