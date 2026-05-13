import { LogoutUseCase } from '../application/use-cases/logout/logout.use-case.js'
import { RedisSessionStore } from '../infrastructure/cache/redis-session-store.js'

const sessionStore = new RedisSessionStore()

export function makeLogoutUseCase() {
  return new LogoutUseCase(sessionStore)
}
