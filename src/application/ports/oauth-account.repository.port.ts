import type { OAuthProvider } from './oauth-provider.js'

export interface OAuthAccount {
  id: string
  userId: string
  provider: OAuthProvider
  providerUserId: string
}

export interface OAuthAccountRepositoryPort {
  save(account: OAuthAccount): Promise<void>

  findByProviderIdentity(input: {
    provider: OAuthProvider
    providerUserId: string
  }): Promise<OAuthAccount | null>
}
