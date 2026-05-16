export type OAuthProviders = 'google' | 'github'

export interface OAuthAccount {
  id: string
  user_id: string
  provider: OAuthProviders
  provider_user_id: string
}

export interface UserOAuthAccountsPort {
  save(accountData: OAuthAccount): Promise<void>
  findByUserId(
    userId: string,
  ): Promise<Pick<OAuthAccount, 'provider_user_id'> | null>
}
