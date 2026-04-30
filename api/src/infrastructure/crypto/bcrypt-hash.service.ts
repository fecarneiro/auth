import bcrypt from 'bcrypt';
import type { HashServicePort } from '../../application/ports/hash.service.port.js';

export class BcryptHashService implements HashServicePort {
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
