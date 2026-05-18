import type { AccountSnapshot } from '../../../domain/account/account.entity.js'
import type { OAuthConnectionRecord } from '../oauth/oauth-connection.repository.port.js'

export interface AccountRegistrationRepositoryPort {
  createWithPassword(input: { account: AccountSnapshot }): Promise<void>

  createWithOAuthConnection(input: {
    account: AccountSnapshot
    oauthConnection: OAuthConnectionRecord
  }): Promise<void>
}
