import type { OAuthProvider } from './oauth-provider.js'

export interface OAuthIdentity {
  provider: OAuthProvider
  providerUserId: string
  email: string | null
  emailVerified: boolean | null
  name: string | null
  pictureUrl: string | null
}
