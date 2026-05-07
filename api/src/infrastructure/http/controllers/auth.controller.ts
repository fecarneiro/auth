import type { Request, Response } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/login/login.use-case.js';
import type { RegisterUserUseCase } from '../../../application/use-cases/register-user/register-user.use-case.js';
import { AppError } from '../errors/app-error.js';

export class AuthController {
  private readonly registerUserUseCase: RegisterUserUseCase;
  private readonly loginUseCase: LoginUseCase;
  constructor(registerUserUseCase: RegisterUserUseCase, loginUseCase: LoginUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUseCase = loginUseCase;
  }

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      throw new AppError('Email, name and password are required', 400);
    }


    const result = await this.registerUserUseCase.execute({ email, name, password });
    return res.status(200).json(result);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await this.loginUseCase.execute({ email, password });
    return res.status(200).json(result);
  };
}
