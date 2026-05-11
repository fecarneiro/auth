// Regenerate: new login
// Invalidate

export interface UserSession {
  sessionId: string
  userId: string
  createdAt: Date
}

export interface SessionStorePort {
  set(input: UserSession): Promise<void>
  get(input: UserSession): Promise<UserSession | null>
}
