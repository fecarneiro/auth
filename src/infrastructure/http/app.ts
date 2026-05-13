import cookieParser from 'cookie-parser'
import express from 'express'
import { RedisSessionStore } from '../cache/redis-session-store.js'
import { makeLoginUseCase } from '../composition/make-login-use-case.js'
import { makeLogoutUseCase } from '../composition/make-logout-use-case.js'
import { makeRegisterUseCase } from '../composition/make-register-use-case.js'
import { AuthMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { createHealthCheck } from './routes/health.route.js'
import { testRoute } from './routes/test.routes.js'

const loginUseCase = makeLoginUseCase()
const registerUseCase = makeRegisterUseCase()
const logoutUseCase = makeLogoutUseCase()

export const app = express()
const sesionStore = new RedisSessionStore()
const authMiddleware = new AuthMiddleware(sesionStore)

app.use(express.json())
app.use(cookieParser('secret'))

app.use('/health', createHealthCheck())
app.use('/auth', createAuthRouter(registerUseCase, loginUseCase, logoutUseCase))

app.use(authMiddleware.validate)
app.use('/test', testRoute())

app.use(errorMiddleware)
