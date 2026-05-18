export interface AuthSession {
  id: string
  accountId: string
}

export interface SessionStorePort {
  create(session: AuthSession): Promise<void>
  findById(sessionId: string): Promise<AuthSession | null>
  delete(sessionId: string): Promise<void>
}
