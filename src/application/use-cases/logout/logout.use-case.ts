import type { SessionStorePort } from '../../ports/session-store.port.js'

export class LogoutUseCase {
  constructor(
    private readonly sessionStore: Pick<SessionStorePort, 'invalidate'>,
  ) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionStore.invalidate(sessionId)
  }
}
