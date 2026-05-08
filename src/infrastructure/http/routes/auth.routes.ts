import type { Request, Response } from 'express'
import { Router } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { RegisterWithPasswordUseCase } from '../../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { AuthController } from '../controllers/auth.controller.js'

export function createAuthRouter(
  registerWithPasswordUseCase: RegisterWithPasswordUseCase,
  loginUseCase: LoginUseCase,
) {
  const router = Router()
  const controller = new AuthController(
    registerWithPasswordUseCase,
    loginUseCase,
  )

  router.post('/register', (req: Request, res: Response) => {
    return controller.register(req, res)
  })

  router.post('/login', (req: Request, res: Response) => {
    return controller.login(req, res)
  })

  return router
}
