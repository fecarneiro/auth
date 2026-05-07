import bcrypt from 'bcrypt';
import type { HashServicePort } from '../../application/ports/hash.service.port.js';

const SALT_ROUNDS = 10;

export class BcryptHashService implements HashServicePort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
