import cookieParser from 'cookie-parser'
import express from 'express'
import { makeLoginUseCase } from './composition/make-login-use-case.js'
import { makeRegisterUseCase } from './composition/make-register-use-case.js'
import { errorMiddleware } from './infrastructure/http/middlewares/error.middleware.js'
import { createAuthRouter } from './infrastructure/http/routes/auth.routes.js'
import { createHealthCheck } from './infrastructure/http/routes/health.route.js'

const loginUseCase = makeLoginUseCase()
const registerUseCase = makeRegisterUseCase()

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/health', createHealthCheck())
app.use('/auth', createAuthRouter(registerUseCase, loginUseCase))

app.use(errorMiddleware)
