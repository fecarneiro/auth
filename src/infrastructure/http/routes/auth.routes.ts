import type { Request, Response } from 'express'
import { Router } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
import type { RegisterUseCase } from '../../../application/use-cases/register/register.use-case.js'
import { AuthController } from '../controllers/auth.controller.js'

export function createAuthRouter(
  RegisterUseCase: RegisterUseCase,
  loginUseCase: LoginUseCase,
  logoutUseCase: LogoutUseCase,
) {
  const router = Router()
  const controller = new AuthController(
    RegisterUseCase,
    loginUseCase,
    logoutUseCase,
  )

  router.post('/register', (req: Request, res: Response) => {
    return controller.register(req, res)
  })

  router.post('/login', (req: Request, res: Response) => {
    return controller.login(req, res)
  })

  router.post('/logout', (req: Request, res: Response) => {
    return controller.logout(req, res)
  })

  return router
}
