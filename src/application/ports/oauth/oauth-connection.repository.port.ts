import type { OAuthProvider } from '../../../domain/account.entity.js'

export interface OAuthConnectionRecord {
  id: string
  accountId: string
  provider: OAuthProvider
  providerUserId: string
}

export interface OAuthConnectionRepositoryPort {
  save(connection: OAuthConnectionRecord): Promise<void>

  findByProviderIdentity(input: {
    provider: OAuthProvider
    providerUserId: string
  }): Promise<OAuthConnectionRecord | null>
}
