import { describe, expect, it, vi } from 'vitest'
import { type RedisClient, RedisSessionStore } from './redis-session-store.js'

const userId = '019e16fe-4930-7444-a255-9d19fb8afe5a'
const sessionId =
  '39fe2d2d1d6b87dd9a92c5G3ccf0218be575f5b44dc6938e15477c3b3d21e27c'
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

describe('Redis Session Store', () => {
  it('should set new session', async () => {
    const { sut, fakeClient } = makeSut()

    await sut.create({
      id: sessionId,
      userId,
    })

    expect(fakeClient.setEx).toHaveBeenCalledWith(
      prefix + sessionId,
      ttl,
      JSON.stringify({ userId }),
    )
  })

  it('should get a session', async () => {
    const { sut, fakeClient } = makeSut()

    vi.mocked(fakeClient.get).mockResolvedValue(JSON.stringify({ userId }))

    const findSession = await sut.findById(sessionId)

    expect(findSession).toEqual({ userId })
    expect(fakeClient.get).toHaveBeenCalledWith(prefix + sessionId)
  })

  it('should fail getting a session', async () => {
    const { sut, fakeClient } = makeSut()

    const invalidSession = 'a2b4v8'

    vi.mocked(fakeClient.get).mockResolvedValue(null)

    const getSession = await sut.findById(invalidSession)

    expect(getSession).toBe(null)
    expect(fakeClient.get).toHaveBeenCalledWith(prefix + invalidSession)
  })

  it('should invalidate a session', async () => {
    const { sut, fakeClient } = makeSut()

    await sut.delete(sessionId)

    expect(fakeClient.del).toHaveBeenCalledWith(prefix + sessionId)
  })
})
