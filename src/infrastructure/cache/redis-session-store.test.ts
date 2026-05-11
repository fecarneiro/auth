import { describe, expect, it, vi } from 'vitest'
import { type RedisClient, RedisSessionStore } from './redis-session-store.js'

const userId = '019e16fe-4930-7444-a255-9d19fb8afe5a'
const prefix = 'session:'
const ttl = 3000

function makeSut() {
  const fakeClient: RedisClient = {
    setEx: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  }
  const sut = new RedisSessionStore(fakeClient, prefix, ttl)

  return { fakeClient, sut }
}

describe('Redis Session Stpre', () => {
  it('should set new session', async () => {
    const { sut, fakeClient } = makeSut()

    const newSession = await sut.set(userId)

    expect(newSession).toMatch(/^[a-f0-9]{64}$/)
    expect(fakeClient.setEx).toHaveBeenCalledWith(
      prefix + newSession,
      ttl,
      JSON.stringify({ userId }),
    )
  })

  it('should get a session', async () => {
    const { sut, fakeClient } = makeSut()

    vi.mocked(fakeClient.get).mockResolvedValue(JSON.stringify({ userId }))

    const session = await sut.set(userId)

    const data = await sut.get(session)

    expect(data).toBe(userId)
  })

  it('should invalidate a session', async () => {
    const { sut, fakeClient } = makeSut()

    const sessionId = '123456'

    await sut.invalidate(sessionId)

    expect(fakeClient.del).toHaveBeenCalledWith(prefix + sessionId)
  })
})
