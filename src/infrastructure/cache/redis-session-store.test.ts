import { describe, expect, it, vi } from 'vitest'
import type { SessionData } from '../../application/ports/session-store.port.js'
import { type RedisClient, RedisSessionStore } from './redis-session-store.js'

const userId = '019e16fe-4930-7444-a255-9d19fb8afe5a'
const prefix = 'session:'
const ttl = 3000

const session: SessionData = {
  userId: userId,
}

function makeSut() {
  const fakeClient: RedisClient = {
    setEx: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  }
  const sut = new RedisSessionStore(fakeClient, prefix, ttl)
  return { fakeClient, sut }
}

describe('Redis Session Store', () => {
  it('should set new session', async () => {
    const { sut, fakeClient } = makeSut()

    const newSession = await sut.set(session)

    expect(newSession).toMatch(/^[a-f0-9]{64}$/)
    expect(fakeClient.setEx).toHaveBeenCalledWith(
      prefix + newSession,
      ttl,
      JSON.stringify(session),
    )
  })

  it('should get a session', async () => {
    const { sut, fakeClient } = makeSut()

    vi.mocked(fakeClient.get).mockResolvedValue(JSON.stringify({ userId }))

    const existingSession = 'abc123'

    const getSession = await sut.get(existingSession)

    expect(getSession).toEqual(session)
    expect(fakeClient.get).toHaveBeenCalledWith(prefix + existingSession)
  })

  it('should fail getting a session', async () => {
    const { sut, fakeClient } = makeSut()

    const invalidSession = 'a2b4v8'

    vi.mocked(fakeClient.get).mockResolvedValue(null)

    const getSession = await sut.get(invalidSession)

    expect(getSession).toBe(null)
    expect(fakeClient.get).toHaveBeenCalledWith(prefix + invalidSession)
  })

  it('should invalidate a session', async () => {
    const { sut, fakeClient } = makeSut()

    const sessionId = '123456'

    await sut.invalidate(sessionId)

    expect(fakeClient.del).toHaveBeenCalledWith(prefix + sessionId)
  })
})
