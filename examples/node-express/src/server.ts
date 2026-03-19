import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';
import { AuthonBackend } from '@authon/node';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import mfaRoutes from './routes/mfa.js';
import sessionsRoutes from './routes/sessions.js';
import deleteAccountRoutes from './routes/delete-account.js';
import webhookRoutes from './routes/webhook.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT ?? 3000;

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY ?? '', {
  apiUrl: process.env.AUTHON_API_URL,
});

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use('/webhook', webhookRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.locals['authon'] = authon;
app.locals['publishableKey'] = process.env.AUTHON_PUBLISHABLE_KEY ?? '';
app.locals['apiUrl'] = process.env.AUTHON_API_URL ?? 'https://api.authon.dev';

app.get('/', (req, res) => {
  const token = req.cookies['authon_token'] as string | undefined;
  res.render('home', { token: token ?? null });
});

app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/mfa', mfaRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/delete-account', deleteAccountRoutes);

app.listen(port, () => {
  console.log(`Authon Express example running at http://localhost:${port}`);
});
