import type { Request, Response } from 'express';
import { Router } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js';
import { AuthController } from '../controllers/auth.controller.js';

export function createAuthRouter(loginUseCase: LoginUseCase) {
  const router = Router();
  const controller = new AuthController(loginUseCase);

  router.post('/login', (req: Request, res: Response) => {
    return controller.login(req, res);
  });

  return router;
}
