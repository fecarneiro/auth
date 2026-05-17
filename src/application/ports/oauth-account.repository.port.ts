import type { OAuthProvider } from './oauth-client.port.js'

export interface OAuthAccount {
  id: string
  userId: string
  provider: OAuthProvider
  providerUserId: string
}

export interface OAuthAccountRepositoryPort {
  save(account: OAuthAccount): Promise<void>

  findByProviderAccount(input: {
    provider: OAuthProvider
    providerUserId: string
  }): Promise<OAuthAccount | null>
}
