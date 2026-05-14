import type {
  AuthSession,
  SessionStorePort,
} from '../../application/ports/session-store.port.js'
import { SESSION_TTL_SECONDS } from '../config/session.config.js'
import { redisClient } from './redis.js'

export interface RedisClient {
  setEx(key: string, seconds: number, value: string): Promise<string>
  get(key: string): Promise<string | null>
  del(key: string | string[]): Promise<number>
}

export class RedisSessionStore implements SessionStorePort {
  constructor(
    private readonly client: RedisClient = redisClient,
    private readonly prefix = 'session:',
    private readonly ttl = SESSION_TTL_SECONDS,
  ) {}

  async create(sessionData: AuthSession): Promise<void> {
    await this.client.setEx(
      this.prefix + sessionData.id,
      this.ttl,
      JSON.stringify({ userId: sessionData.userId }),
    )
  }

  async findById(sessionId: string): Promise<AuthSession | null> {
    const raw = await this.client.get(this.prefix + sessionId)
    if (!raw) return null
    return JSON.parse(raw)
  }

  async delete(sessionId: string): Promise<void> {
    await this.client.del(this.prefix + sessionId)
  }
}
