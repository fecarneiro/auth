import express from 'express';
import { makeLoginUseCase } from './factories/make-login-use-case.js';
import { createAuthRouter } from './infrastructure/http/routes/auth.routes.js';

const loginUseCase = makeLoginUseCase();

export const app = express();

app.use(express.json());

app.use('/auth', createAuthRouter(loginUseCase));
