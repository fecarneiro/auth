import crypto from 'node:crypto'
import type { IdGeneratorPort } from '../../application/ports/shared/id-generator.port.js'

export class RandomSessionIdGenerator implements IdGeneratorPort {
  generate(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}
