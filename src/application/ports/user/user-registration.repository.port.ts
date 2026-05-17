import type { User } from '../../../domain/user.entity.js'
import type { OAuthAccount } from '../oauth/oauth-account.repository.port.js'
import type { PasswordCredential } from '../password/password-credential.repository.port.js'

export interface UserRegistrationRepositoryPort {
  createWithPassword(input: {
    user: User
    passwordCredential: PasswordCredential
  }): Promise<void>

  createWithOAuthAccount(input: {
    user: User
    oauthAccount: OAuthAccount
  }): Promise<void>
}
