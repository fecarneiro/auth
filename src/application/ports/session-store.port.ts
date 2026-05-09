// Regenerate: new login
// Invalidate

export interface UserSession {
  sessionId: string
  userId: string
  createdAt: Date
}

export interface SessionStorePort {
  set(userId: string): Promise<void>
  get(userId: string): Promise<UserSession | null>
}
