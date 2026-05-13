import { v7 as uuidv7 } from 'uuid'
import type { IdGeneratorPort } from '../../application/ports/id-generator.port.js'

export class UuidV7EntityIdGenerator implements IdGeneratorPort {
  generate(): string {
    return uuidv7()
  }
}
