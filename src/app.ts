import cookieParser from 'cookie-parser'
import express from 'express'
import { makeLoginUseCase } from './composition/make-login-use-case.js'
import { makeRegisterUseCase } from './composition/make-register-use-case.js'
import { RedisSessionStore } from './infrastructure/cache/redis-session-store.js'
import { AuthMiddleware } from './infrastructure/http/middlewares/auth.middleware.js'
import { errorMiddleware } from './infrastructure/http/middlewares/error.middleware.js'
import { createAuthRouter } from './infrastructure/http/routes/auth.routes.js'
import { createHealthCheck } from './infrastructure/http/routes/health.route.js'
import { testRoute } from './infrastructure/http/routes/test.routes.js'

const loginUseCase = makeLoginUseCase()
const registerUseCase = makeRegisterUseCase()

export const app = express()
const sesionStore = new RedisSessionStore()
const authMiddleware = new AuthMiddleware(sesionStore)

app.use(express.json())
app.use(cookieParser('secret'))

app.use('/health', createHealthCheck())
app.use('/auth', createAuthRouter(registerUseCase, loginUseCase))

app.use(authMiddleware.validate)
app.use('/test', testRoute())

app.use(errorMiddleware)
