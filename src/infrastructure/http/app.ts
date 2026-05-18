import cookieParser from 'cookie-parser'
import express from 'express'
import { compositionRoot } from '../composition/composition-root.js'
import { AuthMiddleware } from './middlewares/auth.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { createHealthCheck } from './routes/health.routes.js'

export const app = express()
const authMiddleware = new AuthMiddleware(compositionRoot.sessionStore)

app.use(express.json())
app.use(cookieParser())

app.use('/health', createHealthCheck())
app.use(
  '/auth',
  createAuthRouter(
    compositionRoot.registerWithPasswordUseCase,
    compositionRoot.loginWithPasswordUseCase,
    compositionRoot.logoutUseCase,
    compositionRoot.authenticateWithOAuthUseCase,
    compositionRoot.linkOAuthProviderUseCase,
    compositionRoot.getAuthenticatedAccountUseCase,
    authMiddleware.validate,
    compositionRoot.sessionStore,
  ),
)

app.use(errorMiddleware)
