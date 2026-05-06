import type { NextFunction, Request, Response } from 'express';
import { mapErrorToHttp } from '../errors/map-error-to-http.js';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  const appError = mapErrorToHttp(err);

  return res.status(appError.statusCode).json({
    message: appError.message,
  });
}
