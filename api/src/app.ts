import express from 'express';
import { makeLoginUseCase } from './factories/make-login-use-case.js';
import { errorHandler } from './infrastructure/http/errors/error-handler.js';
import { createAuthRouter } from './infrastructure/http/routes/auth.routes.js';
import { createHealthCheck } from './infrastructure/http/routes/health.route.js';

const loginUseCase = makeLoginUseCase();

export const app = express();

app.use(express.json());

app.use('/health', createHealthCheck());
app.use('/auth', createAuthRouter(loginUseCase));
app.use(errorHandler);
