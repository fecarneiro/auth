import * as arctic from 'arctic'
import type { OAuthIdentity } from '../../application/ports/oauth/oauth-identity.js'
import { env } from '../config/env.config.js'

const google = new arctic.Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
)

export function createGoogleAuthorizationURL(input: {
  state: string
  codeVerifier: string
  scopes: string[]
}): URL {
  return google.createAuthorizationURL(
    input.state,
    input.codeVerifier,
    input.scopes,
  )
}

export async function getGoogleIdentityFromAuthorizationCode(input: {
  code: string
  codeVerifier: string
}): Promise<OAuthIdentity> {
  const tokens = await google.validateAuthorizationCode(
    input.code,
    input.codeVerifier,
  )

  const claims = arctic.decodeIdToken(tokens.idToken())

  return mapGoogleClaimsToOAuthIdentity(claims)
}

function mapGoogleClaimsToOAuthIdentity(claims: unknown): OAuthIdentity {
  if (!isRecord(claims)) {
    throw new Error('Invalid Google OAuth claims')
  }

  const subject = claims.sub

  if (typeof subject !== 'string') {
    throw new Error('Google OAuth subject is missing')
  }

  return {
    provider: 'google',
    providerUserId: subject,
    email: typeof claims.email === 'string' ? claims.email : null,
    emailVerified:
      typeof claims.email_verified === 'boolean' ? claims.email_verified : null,
    name: typeof claims.name === 'string' ? claims.name : null,
    pictureUrl: typeof claims.picture === 'string' ? claims.picture : null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
