import crypto from 'node:crypto'
import type { SessionStorePort } from '../../application/ports/session-store.port.js'
import { redisClient } from './redis.js'

export class RedisSessionStore implements SessionStorePort {
  constructor(
    private readonly client = redisClient,
    private readonly ttl = 1800,
  ) {}

  async set(userId: string): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex')

    await this.client.setEx(
      `session:${sessionId}`,
      this.ttl,
      JSON.stringify({ userId }),
    )

    return sessionId
  }

  async get(sessionId: string): Promise<string | null> {
    const session = await this.client.get(`session:${sessionId}`)
    if (!session) return null

    return session
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.client.del(`session:${sessionId}`)
  }
}
