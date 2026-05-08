export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = this.constructor.name

    Object.setPrototypeOf(this, this.constructor.prototype)
  }
}
