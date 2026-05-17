import type { SessionStorePort } from '../../ports/session/session-store.port.js'

export class LogoutUseCase {
  constructor(
    private readonly sessionStore: Pick<SessionStorePort, 'delete'>,
  ) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionStore.delete(sessionId)
  }
}
