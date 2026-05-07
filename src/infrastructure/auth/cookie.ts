import type { CookieOptions } from 'express'

export const SESSION_COOKIE_NAME = 'session_id'

export const sessionCookieOptions: CookieOptions = {
  path: '/',
  maxAge: 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  // secure: process.env.NODE_ENV === "production",
}
