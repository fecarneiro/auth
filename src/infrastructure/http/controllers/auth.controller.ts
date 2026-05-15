import type { Request, Response } from 'express'
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
import type { RegisterUseCase } from '../../../application/use-cases/register/register.use-case.js'
import { cookieOptions } from '../cookie/cookie-options.js'
import { AppError } from '../errors/app-error.js'

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      throw new AppError('Email, name and password are required', 400)
    }

    const result = await this.registerUseCase.execute({
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

    const session = await this.loginUseCase.execute({ email, password })
    const { user, sessionId } = session

    res.cookie('sid', sessionId, cookieOptions)

    return res.status(200).json(user)
  }

  logout = async (req: Request, res: Response) => {
    const sessionId = req.cookies.sid

    if (!sessionId) return res.status(200).json({ message: 'OK' })

    await this.logoutUseCase.execute(sessionId)
    res.clearCookie('sid')

    return res.status(200).json({ message: 'OK' })
  }
}
