import type { Request, Response } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js';
import { AppError } from '../errors/app-error.js';

export class AuthController {
  private readonly loginUseCase: LoginUseCase;
  constructor(loginUseCase: LoginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await this.loginUseCase.execute({ email, password });
    return res.status(200).json(result);
  };
}
