import type { Request, Response } from 'express'
import { Router } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { RegisterUserUseCase } from '../../../application/use-cases/register-user/register-user.use-case.js'
import { AuthController } from '../controllers/auth.controller.js'

export function createAuthRouter(
  registerUserUseCase: RegisterUserUseCase,
  loginUseCase: LoginUseCase,
) {
  const router = Router()
  const controller = new AuthController(registerUserUseCase, loginUseCase)

  router.post('/register', (req: Request, res: Response) => {
    return controller.register(req, res)
  })

  router.post('/login', (req: Request, res: Response) => {
    return controller.login(req, res)
  })

  return router
}
