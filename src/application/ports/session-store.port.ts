// Regenerate: new login
// Invalidate

export interface SessionStorePort {
  set(userId: string): Promise<string>
  get(sessionId: string): Promise<string | null>
  invalidate(sessionId: string): Promise<void>
}
