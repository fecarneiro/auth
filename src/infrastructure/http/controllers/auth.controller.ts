import type { Request, Response } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { RegisterUseCase } from '../../../application/use-cases/register/register.use-case.js'
import { sessionCookieOptions } from '../cookie/session-cookie.js'
import { AppError } from '../errors/app-error.js'

export class AuthController {
  constructor(
    private readonly RegisterUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      throw new AppError('Email, name and password are required', 400)
    }

    const result = await this.RegisterUseCase.execute({
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

    res.cookie('sid', result.sessionId, sessionCookieOptions)

    return res.status(200).json(result)
  }
}
