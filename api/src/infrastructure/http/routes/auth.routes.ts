import { Router } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js';
import { AuthController } from '../controllers/auth.controller.js';

export function createAuthRouter(loginUseCase: LoginUseCase) {
  const router = Router();

  router.post('/login', async (_req, _res) => {});

  const login = new AuthController(loginUseCase);

  return router;
}
