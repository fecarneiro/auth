export class OAuthEmailNotProvidedError extends Error {
  constructor() {
    super('OAuth provider did not provide an email')
    this.name = 'OAuthEmailNotProvidedError'
  }
}

export class OAuthEmailNotVerifiedError extends Error {
  constructor() {
    super('OAuth email is not verified')
    this.name = 'OAuthEmailNotVerifiedError'
  }
}

export class OAuthEmailAlreadyRegisteredError extends Error {
  constructor() {
    super(
      'An account with this email already exists. Sign in with your original method and connect this provider from your account settings.',
    )
    this.name = 'OAuthEmailAlreadyRegisteredError'
  }
}

export class OAuthLinkedAccountNotFoundError extends Error {
  constructor() {
    super('OAuth linked account not found')
    this.name = 'OAuthLinkedAccountNotFoundError'
  }
}
