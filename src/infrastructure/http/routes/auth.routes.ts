import * as arctic from 'arctic'
import type { Request, RequestHandler, Response } from 'express'
import { Router } from 'express'
import type { SessionStorePort } from '../../../application/ports/session/session-store.port.js'
import type { AuthenticateWithOAuthUseCase } from '../../../application/use-cases/authenticate-with-oauth/authenticate-with-oauth.use-case.js'
import type { GetAuthenticatedAccountUseCase } from '../../../application/use-cases/get-authenticated-account/get-authenticated-account.use-case.js'
import type { LinkOAuthProviderUseCase } from '../../../application/use-cases/link-oauth-provider/link-oauth-provider.use-case.js'
import type { LoginWithPasswordUseCase } from '../../../application/use-cases/login-with-password/login-with-password.use-case.js'
import type { LogoutUseCase } from '../../../application/use-cases/logout/logout.use-case.js'
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
  authenticateWithOAuthUseCase: AuthenticateWithOAuthUseCase,
  linkOAuthProviderUseCase: LinkOAuthProviderUseCase,
  getAuthenticatedAccountUseCase: GetAuthenticatedAccountUseCase,
  authMiddleware: RequestHandler,
  sessionStore: Pick<SessionStorePort, 'findById'>,
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

  router.get('/google', (_req: Request, res: Response) => {
    return startGoogleOAuthFlow(res, 'continue')
  })

  router.get('/google/link', authMiddleware, (_req: Request, res: Response) => {
    return startGoogleOAuthFlow(res, 'link')
  })

  router.get('/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code
    const state = req.query.state
    const storedState = req.cookies.oauth_state ?? null
    const storedCodeVerifier = req.cookies.oauth_code_verifier ?? null
    const purpose = req.cookies.oauth_purpose ?? null

    if (
      typeof code !== 'string' ||
      typeof storedState !== 'string' ||
      state !== storedState ||
      typeof storedCodeVerifier !== 'string' ||
      !isOAuthPurpose(purpose)
    ) {
      return res.status(400).json({ message: 'Invalid request' })
    }

    const identity = await getGoogleIdentityFromAuthorizationCode({
      code,
      codeVerifier: storedCodeVerifier,
    })

    res.clearCookie('oauth_state')
    res.clearCookie('oauth_code_verifier')
    res.clearCookie('oauth_purpose')

    if (purpose === 'link') {
      const sessionId = req.cookies.sid
      const session =
        typeof sessionId === 'string'
          ? await sessionStore.findById(sessionId)
          : null

      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const linked = await linkOAuthProviderUseCase.execute({
        accountId: session.accountId,
        identity,
      })

      return res.status(200).json(linked.account)
    }

    const result = await authenticateWithOAuthUseCase.execute({ identity })

    res.cookie('sid', result.sessionId, cookieOptions)

    return res.status(200).json(result.account)
  })

  return router
}

type OAuthPurpose = 'continue' | 'link'

const oauthCookieOptions = {
  ...cookieOptions,
  maxAge: 60 * 10 * 1000,
}

function startGoogleOAuthFlow(res: Response, purpose: OAuthPurpose) {
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
  res.cookie('oauth_purpose', purpose, oauthCookieOptions)

  return res.redirect(url.toString())
}

function isOAuthPurpose(value: unknown): value is OAuthPurpose {
  return value === 'continue' || value === 'link'
}
