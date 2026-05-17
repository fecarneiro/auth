import { v7 as uuidv7 } from 'uuid'
import type { IdGeneratorPort } from '../../application/ports/shared/id-generator.port.js'

export class UuidV7IdGenerator implements IdGeneratorPort {
  generate(): string {
    return uuidv7()
  }
}
