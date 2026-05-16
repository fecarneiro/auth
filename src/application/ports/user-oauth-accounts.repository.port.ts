import type { OAuthProvider } from './oauth-provider.port.js'

export interface OAuthAccount {
  id: string
  user_id: string
  provider: OAuthProvider
  provider_user_id: string
}

export interface UserOAuthAccountsRepositoryPort {
  save(accountData: OAuthAccount): Promise<void>
  findByUserId(
    userId: string,
  ): Promise<Pick<OAuthAccount, 'provider_user_id'> | null>
}
