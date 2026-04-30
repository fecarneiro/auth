import { Router } from 'express';
import { InvalidCredentialsError } from '../../application/auth.errors.js';
import type { LoginUseCase } from '../../application/login.use-case.js';

export function createAuthRouter(loginUseCase: LoginUseCase) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const result = await loginUseCase.execute({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
