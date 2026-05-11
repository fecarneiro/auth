export interface SessionData {
  userId: string
}

export interface SessionStorePort {
  set(sessionData: SessionData): Promise<string>
  get(sessionId: string): Promise<SessionData | null>
  invalidate(sessionId: string): Promise<void>
  // expire(key: string, seconds: number): Promise<number> //revalidate
}
