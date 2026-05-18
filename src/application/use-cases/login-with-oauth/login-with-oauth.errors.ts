export class OAuthConnectionNotFoundError extends Error {
  constructor() {
    super('OAuth connection not found')
    this.name = 'OAuthConnectionNotFoundError'
  }
}

export class OAuthLinkedAccountNotFoundError extends Error {
  constructor() {
    super('OAuth linked account not found')
    this.name = 'OAuthLinkedAccountNotFoundError'
  }
}
