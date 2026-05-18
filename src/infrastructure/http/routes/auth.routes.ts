import * as arctic from 'arctic'
import type { Request, Response } from 'express'
import { Router } from 'express'
import type { LoginWithPasswordUseCase } from '../../../application/use-cases/login-with-password/login-with-password.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
import type { RegisterWithPasswordUseCase } from '../../../application/use-cases/register-with-password/register-with-password.use-case.js'
import { google } from '../../oauth/google-oauth-client.js'
import { AuthController } from '../controllers/auth.controller.js'

export function createAuthRouter(
  registerUseCase: RegisterWithPasswordUseCase,
  loginUseCase: LoginWithPasswordUseCase,
  logoutUseCase: LogoutUseCase,
) {
  const router = Router()
  const controller = new AuthController(
    registerUseCase,
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

  router.get('/google', (_req: Request, res: Response) => {
    const state = arctic.generateState()
    const codeVerifier = arctic.generateCodeVerifier()

    const scopes = ['openid', 'profile', 'email']

    const url = google.createAuthorizationURL(state, codeVerifier, scopes)

    res.cookie('state', state, {
      secure: true,
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10,
    })

    res.cookie('code_verifier', codeVerifier, {
      secure: true,
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10,
    })

    return res.redirect(url.toString())
  })

  router.get('/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code
    const state = req.query.state
    const storedState = req.cookies.state ?? null
    const storedCodeVerifier = req.cookies.code_verifier ?? null

    if (
      typeof code !== 'string' ||
      typeof storedState !== 'string' ||
      state !== storedState ||
      typeof storedCodeVerifier !== 'string'
    ) {
      return res.status(400).json({ message: 'Invalid request' })
    }

    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    )
    const idToken = tokens.idToken()
    const _claims = arctic.decodeIdToken(idToken)
    console.log(_claims)

    return res.status(200).json({ message: 'Authorized' })
  })

  return router
}
