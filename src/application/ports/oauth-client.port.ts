export type OAuthProvider = 'google' | 'github'

export interface OAuthIdentity {
  provider: OAuthProvider
  providerUserId: string
  email: string | null
  emailVerified: boolean | null
  name: string | null
  pictureUrl: string | null
}

export interface OAuthClientPort {
  generateState(): string
  generateCodeVerifier(): string

  createAuthorizationURL(input: {
    state: string
    codeVerifier: string
    scopes: string[]
  }): URL

  getIdentityFromAuthorizationCode(input: {
    code: string
    codeVerifier: string
  }): Promise<OAuthIdentity>
}
