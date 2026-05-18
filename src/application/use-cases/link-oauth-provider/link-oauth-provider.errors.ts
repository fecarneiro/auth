export class OAuthConnectionAlreadyExistsError extends Error {
  constructor() {
    super('This OAuth identity is already connected to another account')
    this.name = 'OAuthConnectionAlreadyExistsError'
  }
}

export class LinkAccountNotFoundError extends Error {
  constructor() {
    super('The authenticated account no longer exists')
    this.name = 'LinkAccountNotFoundError'
  }
}
