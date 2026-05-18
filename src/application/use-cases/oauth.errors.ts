export class OAuthConnectionAlreadyExistsError extends Error {
  constructor() {
    super('OAuth connection already exists')
    this.name = 'OAuthConnectionAlreadyExistsError'
  }
}

export class OAuthConnectionNotFoundError extends Error {
  constructor() {
    super('OAuth connection not found')
    this.name = 'OAuthConnectionNotFoundError'
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

export class OAuthLinkedAccountNotFoundError extends Error {
  constructor() {
    super('OAuth linked account not found')
    this.name = 'OAuthLinkedAccountNotFoundError'
  }
}
