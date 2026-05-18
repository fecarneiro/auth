import cookieParser from 'cookie-parser'
import express from 'express'
import { makeLoginWithOAuthUseCase } from '../composition/make-login-with-oauth.js'
import { makeLoginUseCase } from '../composition/make-login-with-password.js'
import { makeLogoutUseCase } from '../composition/make-logout.js'
import { makeRegisterWithOAuthUseCase } from '../composition/make-register-with-oauth.js'
import { makeRegisterWithPasswordUseCase } from '../composition/make-register-with-password.js'
import { RedisSessionStore } from '../session/redis-session-store.js'
import { AuthMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { createHealthCheck } from './routes/health.routes.js'
import { testRoute } from './routes/test.routes.js'

const loginUseCase = makeLoginUseCase()
const registerUseCase = makeRegisterWithPasswordUseCase()
const logoutUseCase = makeLogoutUseCase()
const loginWithOAuthUseCase = makeLoginWithOAuthUseCase()
const registerWithOAuthUseCase = makeRegisterWithOAuthUseCase()

export const app = express()
const sesionStore = new RedisSessionStore()
const authMiddleware = new AuthMiddleware(sesionStore)

app.use(express.json())
app.use(cookieParser('secret'))

app.use('/health', createHealthCheck())
app.use(
  '/auth',
  createAuthRouter(
    registerUseCase,
    loginUseCase,
    logoutUseCase,
    registerWithOAuthUseCase,
    loginWithOAuthUseCase,
  ),
)

app.use(authMiddleware.validate)
app.use('/test', testRoute())

app.use(errorMiddleware)
