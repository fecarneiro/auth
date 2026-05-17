export class OAuthLinkedUserNotFoundError extends Error {
  constructor() {
    super('OAuth linked user not found')
    this.name = 'OAuthLinkedUserNotFoundError'
  }
}

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
