import type { Request, Response } from 'express'
import type { GetAuthenticatedAccountUseCase } from '../../../application/use-cases/get-authenticated-account/get-authenticated-account.use-case.js'
import type { LoginWithPasswordUseCase } from '../../../application/use-cases/login-with-password/login-with-password.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
import type { RegisterWithPasswordUseCase } from '../../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { cookieOptions } from '../cookie/cookie-options.js'
import { AppError } from '../errors/app-error.js'
import {
  type LoginRequestBody,
  loginBodySchema,
  type RegisterRequestBody,
  registerBodySchema,
} from '../validation/auth.schemas.js'

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterWithPasswordUseCase,
    private readonly loginUseCase: LoginWithPasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getAuthenticatedAccountUseCase: GetAuthenticatedAccountUseCase,
  ) {}

  register = async (req: Request, res: Response) => {
    const body: RegisterRequestBody = registerBodySchema.parse(req.body)

    const result = await this.registerUseCase.execute(body)
    return res.status(201).json(result)
  }

  login = async (req: Request, res: Response) => {
    const credentials: LoginRequestBody = loginBodySchema.parse(req.body)

    const session = await this.loginUseCase.execute(credentials)
    const { account, sessionId } = session

    res.cookie('sid', sessionId, cookieOptions)

    return res.status(200).json(account)
  }

  logout = async (req: Request, res: Response) => {
    const sessionId = req.cookies.sid

    if (!sessionId) return res.status(200).json({ message: 'OK' })

    await this.logoutUseCase.execute(sessionId)
    res.clearCookie('sid')

    return res.status(200).json({ message: 'OK' })
  }

  me = async (req: Request, res: Response) => {
    const accountId = req.account?.accountId

    if (!accountId) {
      throw new AppError('Unauthorized', 401)
    }

    const account = await this.getAuthenticatedAccountUseCase.execute({
      accountId,
    })

    return res.status(200).json(account)
  }
}
