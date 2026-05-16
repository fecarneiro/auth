import { InvalidCredentialsError } from '../../../application/use-cases/login-with-password/login-with-password.errors.js'
import { EmailAlreadyInUseError } from '../../../application/use-cases/register/register.errors.js'
import {
  InvalidEmailError,
  InvalidNameError,
} from '../../../domain/user.errors.js'
import { AppError } from './app-error.js'

const httpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
} as const

export function mapErrorToHttp(err: unknown): AppError {
  if (err instanceof InvalidEmailError) {
    return new AppError(err.message, httpStatusCode.BAD_REQUEST)
  }

  if (err instanceof InvalidNameError) {
    return new AppError(err.message, httpStatusCode.BAD_REQUEST)
  }

  if (err instanceof InvalidCredentialsError) {
    return new AppError(err.message, httpStatusCode.UNAUTHORIZED)
  }

  if (err instanceof EmailAlreadyInUseError) {
    return new AppError(err.message, httpStatusCode.CONFLICT)
  }

  if (err instanceof AppError) {
    return err
  }

  return new AppError('Internal server error', httpStatusCode.INTERNAL_SERVER)
}
