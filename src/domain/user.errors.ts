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
