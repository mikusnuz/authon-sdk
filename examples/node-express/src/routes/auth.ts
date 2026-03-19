import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.get('/sign-in', (req: Request, res: Response) => {
  const token = req.cookies['authon_token'] as string | undefined;
  if (token) {
    res.redirect('/profile');
    return;
  }
  res.render('sign-in', {
    error: null,
    publishableKey: req.app.locals['publishableKey'],
    apiUrl: req.app.locals['apiUrl'],
  });
});

router.get('/sign-up', (req: Request, res: Response) => {
  const token = req.cookies['authon_token'] as string | undefined;
  if (token) {
    res.redirect('/profile');
    return;
  }
  res.render('sign-up', {
    error: null,
    publishableKey: req.app.locals['publishableKey'],
    apiUrl: req.app.locals['apiUrl'],
  });
});

router.get('/reset-password', (req: Request, res: Response) => {
  res.render('reset-password', {
    publishableKey: req.app.locals['publishableKey'],
    apiUrl: req.app.locals['apiUrl'],
  });
});

router.post('/sign-out', (req: Request, res: Response) => {
  res.clearCookie('authon_token');
  res.clearCookie('authon_refresh_token');
  res.redirect('/sign-in');
});

router.post('/auth/set-token', (req: Request, res: Response) => {
  const { accessToken, refreshToken } = req.body as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!accessToken) {
    res.status(400).json({ error: 'Missing accessToken' });
    return;
  }

  res.cookie('authon_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });

  if (refreshToken) {
    res.cookie('authon_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  res.json({ ok: true });
});

export default router;
