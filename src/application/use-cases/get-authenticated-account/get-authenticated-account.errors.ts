export class AuthenticatedAccountNotFoundError extends Error {
  constructor() {
    super('Authenticated account not found')
    this.name = 'AuthenticatedAccountNotFoundError'
  }
}
