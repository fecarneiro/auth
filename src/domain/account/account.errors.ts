export class InvalidEmailError extends Error {
  constructor() {
    super('Invalid email')
    this.name = 'InvalidEmailError'
  }
}

export class InvalidNameError extends Error {
  constructor() {
    super('Name must be at least 2 characters')
    this.name = 'InvalidNameError'
  }
}

export class AccountMustHaveAuthenticationMethodError extends Error {
  constructor() {
    super('Account must have at least one authentication method')
    this.name = 'AccountMustHaveAuthenticationMethodError'
  }
}

export class AccountAlreadyHasPasswordError extends Error {
  constructor() {
    super('Account already has a password')
    this.name = 'AccountAlreadyHasPasswordError'
  }
}

export class OAuthProviderAlreadyLinkedError extends Error {
  constructor() {
    super('OAuth provider already linked to this account')
    this.name = 'OAuthProviderAlreadyLinkedError'
  }
}
