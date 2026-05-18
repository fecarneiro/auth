import { ZodError } from 'zod'
import { AuthenticatedAccountNotFoundError } from '../../../application/use-cases/get-authenticated-account/get-authenticated-account.errors.js'
import {
  OAuthConnectionNotFoundError,
  OAuthLinkedAccountNotFoundError,
} from '../../../application/use-cases/login-with-oauth/login-with-oauth.errors.js'
import { InvalidCredentialsError } from '../../../application/use-cases/login-with-password/login-with-password.errors.js'
import {
  OAuthConnectionAlreadyExistsError,
  OAuthEmailNotProvidedError,
  OAuthEmailNotVerifiedError,
} from '../../../application/use-cases/register-with-oauth/register-with-oauth.errors.js'
import { EmailAlreadyInUseError } from '../../../application/use-cases/register-with-password/register-with-password.errors.js'
import {
  InvalidEmailError,
  InvalidNameError,
  OAuthProviderAlreadyLinkedError,
} from '../../../domain/account.errors.js'
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

  if (err instanceof AuthenticatedAccountNotFoundError) {
    return new AppError(err.message, httpStatusCode.UNAUTHORIZED)
  }

  if (err instanceof EmailAlreadyInUseError) {
    return new AppError(err.message, httpStatusCode.CONFLICT)
  }

  if (err instanceof OAuthConnectionNotFoundError) {
    return new AppError(err.message, httpStatusCode.UNAUTHORIZED)
  }

  if (err instanceof OAuthLinkedAccountNotFoundError) {
    return new AppError(err.message, httpStatusCode.NOT_FOUND)
  }

  if (err instanceof OAuthEmailNotProvidedError) {
    return new AppError(err.message, httpStatusCode.BAD_REQUEST)
  }

  if (err instanceof OAuthEmailNotVerifiedError) {
    return new AppError(err.message, httpStatusCode.BAD_REQUEST)
  }

  if (err instanceof OAuthConnectionAlreadyExistsError) {
    return new AppError(err.message, httpStatusCode.CONFLICT)
  }

  if (err instanceof OAuthProviderAlreadyLinkedError) {
    return new AppError(err.message, httpStatusCode.CONFLICT)
  }

  if (err instanceof ZodError) {
    const fields = err.issues.map((issue) => issue.path.join('.')).join(', ')
    return new AppError(
      `Invalid request body: ${fields}`,
      httpStatusCode.BAD_REQUEST,
    )
  }

  if (err instanceof AppError) {
    return err
  }

  return new AppError('Internal server error', httpStatusCode.INTERNAL_SERVER)
}
