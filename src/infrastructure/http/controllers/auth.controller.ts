import type { Request, Response } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { RegisterWithPasswordUseCase } from '../../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { AppError } from '../errors/app-error.js'

export class AuthController {
  constructor(
    private readonly registerWithPasswordUseCase: RegisterWithPasswordUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      throw new AppError('Email, name and password are required', 400)
    }

    const result = await this.registerWithPasswordUseCase.execute({
      email,
      name,
      password,
    })
    return res.status(201).json(result)
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    const result = await this.loginUseCase.execute({ email, password })
    return res.status(200).json(result)
  }
}
