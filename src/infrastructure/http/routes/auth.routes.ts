import * as arctic from 'arctic'
import type { Request, RequestHandler, Response } from 'express'
import { Router } from 'express'
import type { GetAuthenticatedAccountUseCase } from '../../../application/use-cases/get-authenticated-account/get-authenticated-account.use-case.js'
import type { LoginWithOAuthUseCase } from '../../../application/use-cases/login-with-oauth/login-with-oauth.use-case.js'
import type { LoginWithPasswordUseCase } from '../../../application/use-cases/login-with-password/login-with-password.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
import type { RegisterWithOAuthUseCase } from '../../../application/use-cases/register-with-oauth/register-with-oauth.use-case.js'
import type { RegisterWithPasswordUseCase } from '../../../application/use-cases/register-with-password/register-with-password.use-case.js'
import {
  createGoogleAuthorizationURL,
  getGoogleIdentityFromAuthorizationCode,
} from '../../oauth/google-oauth-client.js'
import { AuthController } from '../controllers/auth.controller.js'
import { cookieOptions } from '../cookie/cookie-options.js'

export function createAuthRouter(
  registerUseCase: RegisterWithPasswordUseCase,
  loginUseCase: LoginWithPasswordUseCase,
  logoutUseCase: LogoutUseCase,
  registerWithOAuthUseCase: RegisterWithOAuthUseCase,
  loginWithOAuthUseCase: LoginWithOAuthUseCase,
  getAuthenticatedAccountUseCase: GetAuthenticatedAccountUseCase,
  authMiddleware: RequestHandler,
) {
  const router = Router()
  const controller = new AuthController(
    registerUseCase,
    loginUseCase,
    logoutUseCase,
    getAuthenticatedAccountUseCase,
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

  router.get('/me', authMiddleware, (req: Request, res: Response) => {
    return controller.me(req, res)
  })

  router.get('/google/login', (_req: Request, res: Response) => {
    return startGoogleOAuthFlow(res, 'login')
  })

  router.get('/google/register', (_req: Request, res: Response) => {
    return startGoogleOAuthFlow(res, 'register')
  })

  router.get('/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code
    const state = req.query.state
    const storedState = req.cookies.oauth_state ?? null
    const storedCodeVerifier = req.cookies.oauth_code_verifier ?? null
    const intent = req.cookies.oauth_intent ?? null

    if (
      typeof code !== 'string' ||
      typeof storedState !== 'string' ||
      state !== storedState ||
      typeof storedCodeVerifier !== 'string' ||
      !isOAuthIntent(intent)
    ) {
      return res.status(400).json({ message: 'Invalid request' })
    }

    const identity = await getGoogleIdentityFromAuthorizationCode({
      code,
      codeVerifier: storedCodeVerifier,
    })

    const result =
      intent === 'login'
        ? await loginWithOAuthUseCase.execute({ identity })
        : await registerWithOAuthUseCase.execute({ identity })

    res.clearCookie('oauth_state')
    res.clearCookie('oauth_code_verifier')
    res.clearCookie('oauth_intent')
    res.cookie('sid', result.sessionId, cookieOptions)

    return res.status(200).json(result.account)
  })

  return router
}

type OAuthIntent = 'login' | 'register'

const oauthCookieOptions = {
  ...cookieOptions,
  maxAge: 60 * 10 * 1000,
}

function startGoogleOAuthFlow(res: Response, intent: OAuthIntent) {
  const state = arctic.generateState()
  const codeVerifier = arctic.generateCodeVerifier()
  const scopes = ['openid', 'profile', 'email']
  const url = createGoogleAuthorizationURL({
    state,
    codeVerifier,
    scopes,
  })

  res.cookie('oauth_state', state, oauthCookieOptions)
  res.cookie('oauth_code_verifier', codeVerifier, oauthCookieOptions)
  res.cookie('oauth_intent', intent, oauthCookieOptions)

  return res.redirect(url.toString())
}

function isOAuthIntent(value: unknown): value is OAuthIntent {
  return value === 'login' || value === 'register'
}
