import type { NextFunction, Request, Response } from 'express'
import { mapErrorToHttp } from '../errors/map-error-to-http.js'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const appError = mapErrorToHttp(err)

  if (appError.statusCode >= 500) {
    console.error(err)
  }

  return res.status(appError.statusCode).json({
    message: appError.message,
  })
}
