import type { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(500).json({ message: 'Internal server error' });
}
