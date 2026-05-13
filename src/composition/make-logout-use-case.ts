import { LogoutUseCase } from '../application/use-cases/logout/logout.use-case.js'
import { RedisSessionStore } from '../infrastructure/cache/redis-session-store.js'

export function makeLogoutUseCase() {
  const sessionStore = new RedisSessionStore()
  return new LogoutUseCase(sessionStore)
}
