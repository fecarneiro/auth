import { env } from 'node:process'
import * as arctic from 'arctic'

const clientId = env.GOOGLE_CLIENT_ID
const clientSecret = env.GOOGLE_CLIENT_SECRET
const redirectURI = env.GOOGLE_REDIRECT_URI

if (!clientId || !clientSecret || !redirectURI) {
  throw new Error('Missing Google OAuth env vars')
}

export const google = new arctic.Google(clientId, clientSecret, redirectURI)
