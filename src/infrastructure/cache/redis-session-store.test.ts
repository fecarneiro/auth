import crypto from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { type RedisClient, RedisSessionStore } from './redis-session-store.js'

const userId = '019e16fe-4930-7444-a255-9d19fb8afe5a'
const sessionId = crypto.randomBytes(32).toString('hex')

function makeSut() {
  const fakeClient: RedisClient = {
    setEx: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  }
  const sut = new RedisSessionStore(fakeClient, 1800)

  return { fakeClient, sut }
}

describe('Redis Session', () => {
  it('should create a session ID', async () => {
    const { sut, fakeClient } = makeSut()

    const newSession = await sut.set(userId)
    console.log(newSession)

    expect(newSession).toMatch(/^[a-f0-9]{64}$/)
    expect(fakeClient.setEx).toHaveBeenCalledWith(
      `session:${newSession}`,
      1800,
      JSON.stringify({ userId }),
    )
  })
})
