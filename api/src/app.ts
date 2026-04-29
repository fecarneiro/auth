import express from 'express';

import { authRoutes } from './infrastructure/http/auth.routes.js';

export const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/auth', authRoutes);
