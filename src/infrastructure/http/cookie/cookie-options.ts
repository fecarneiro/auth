import type { CookieOptions } from 'express'
import { env } from '../../config/env.config.js'
import { SESSION_TTL_SECONDS } from '../../config/session.config.js'

export const cookieOptions: CookieOptions = {
  path: '/',
  maxAge: SESSION_TTL_SECONDS * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
}
