// Regenerate: new login
// Invalidate

export interface UserSession {
  sessionId: string
  userId: string
  createdAt: Date
}

export interface SessionRepositoryPort {
  set(userId: string): Promise<void>
  get(userId: string): UserSession
}
