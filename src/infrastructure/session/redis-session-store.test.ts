import { describe, expect, it, vi } from 'vitest'
import type { AuthSession } from '../../application/ports/session-store.port.js'
import {
  SESSION_PREFIX,
  SESSION_TTL_SECONDS,
} from '../config/session.config.js'
import { type RedisClient, RedisSessionStore } from './redis-session-store.js'

const userId = '019e16fe-4930-7444-a255-9d19fb8afe5a'
const sessionId =
  '19f78f104e7059fcb6f9e3f0d17a9412a95754e00729801bebee5997340196e9'
const ttl = SESSION_TTL_SECONDS
const prefix = SESSION_PREFIX

const mockSession: AuthSession = {
  id: sessionId,
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
  it('should create new session', async () => {
    const { sut, fakeClient } = makeSut()

    await sut.create({
      id: sessionId,
      userId,
    })

    expect(fakeClient.setEx).toHaveBeenCalledWith(
      prefix + sessionId,
      ttl,
      JSON.stringify(mockSession),
    )
  })

  it('should get a session', async () => {
    const { sut, fakeClient } = makeSut()

    vi.mocked(fakeClient.get).mockResolvedValue(JSON.stringify(mockSession))

    const getSession = await sut.findById(sessionId)

    expect(getSession).toEqual(mockSession)
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
