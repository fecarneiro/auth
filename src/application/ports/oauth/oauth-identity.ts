import type { OAuthProvider } from '../../../domain/account.entity.js'

export interface OAuthIdentity {
  provider: OAuthProvider
  providerUserId: string
  email: string | null
  emailVerified: boolean | null
  name: string | null
  pictureUrl: string | null
}
