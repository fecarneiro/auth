import { describe, expect, it, vi } from 'vitest'
import type { SessionStorePort } from '../../ports/session/session-store.port.js'
import { LogoutUseCase } from './logout.use-case.js'

function makeSut() {
  const sessionStore: Pick<SessionStorePort, 'delete'> = {
    delete: vi.fn(),
  }

  const sut = new LogoutUseCase(sessionStore)

  return { sut, sessionStore }
}

describe('LogoutUseCase', () => {
  it('should delete the session by id', async () => {
    const { sut, sessionStore } = makeSut()

    await sut.execute('session-1')

    expect(sessionStore.delete).toHaveBeenCalledWith('session-1')
    expect(sessionStore.delete).toHaveBeenCalledTimes(1)
  })
})
