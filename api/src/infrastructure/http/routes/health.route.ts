import type { Request, Response } from 'express';
import { Router } from 'express';

export function createHealthCheck() {
  const router = Router();

  router.get('/', (_req: Request, _res: Response) => {
    throw new Error('Error');
    // return res.status(200).json({ message: 'Healthcheck OK' });
  });

  return router;
}
