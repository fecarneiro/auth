import crypto from 'node:crypto'
import type { SessionStorePort } from '../../application/ports/session-store.port.js'
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
    private readonly ttl = 1800,
  ) {}

  async set(userId: string): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex')

    await this.client.setEx(
      this.prefix + sessionId,
      this.ttl,
      JSON.stringify({ userId }),
    )

    return sessionId
  }

  async get(sessionId: string): Promise<string | null> {
    const raw = await this.client.get(this.prefix + sessionId)
    if (!raw) return null
    return JSON.parse(raw).userId
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.client.del(this.prefix + sessionId)
  }
}
