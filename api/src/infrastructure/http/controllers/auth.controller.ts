import type { Request, Response } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js';

export class AuthController {
  private readonly loginUseCase: LoginUseCase;
  constructor(loginUseCase: LoginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await this.loginUseCase.execute({ email, password });
    return res.status(200).json(result);
  };
}

//   const result = await loginUseCase.execute({ email, password });
//   return res.status(200).json(result);
//   if (error instanceof InvalidCredentialsError) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   return res.status(500).json({ error: 'Internal server error' });
// }
