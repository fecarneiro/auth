export type OAuthProvider = 'google' | 'github'

export interface OAuthIdentity {
  provider: OAuthProvider
  providerUserId: string
  email: string | null
  emailVerified: boolean | null
  name: string | null
  pictureUrl: string | null
}

export interface OAuthProviderPort {
  createAuthorizationURL(input: { state: string; codeVerifier: string }): URL
  getIdentityFromAuthorizationCode(input: {
    code: string
    codeVerifier: string
  }): Promise<OAuthIdentity>
}
