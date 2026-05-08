import type { Request, Response } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { RegisterUserWithPasswordUseCase } from '../../../application/use-cases/register-user-with-password/register-user-with-password.use-case.js'
import { AppError } from '../errors/app-error.js'

export class AuthController {
  constructor(
    private readonly registerUserWithPasswordUseCase: RegisterUserWithPasswordUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      throw new AppError('Email, name and password are required', 400)
    }

    const result = await this.registerUserWithPasswordUseCase.execute({
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
