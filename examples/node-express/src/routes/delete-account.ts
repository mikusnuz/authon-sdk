import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import type { AuthonBackend } from '@authon/node';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  res.render('delete-account', {
    user: req.user,
    error: null,
    publishableKey: req.app.locals['publishableKey'],
    apiUrl: req.app.locals['apiUrl'],
  });
});

router.post('/', (req: Request, res: Response) => {
  const { confirm } = req.body as { confirm?: string };

  if (confirm !== 'DELETE') {
    res.render('delete-account', {
      user: req.user,
      error: 'Please type DELETE to confirm account deletion.',
      publishableKey: req.app.locals['publishableKey'],
      apiUrl: req.app.locals['apiUrl'],
    });
    return;
  }

  const authon = req.app.locals['authon'] as AuthonBackend;
  const userId = req.user!.id;

  authon.users
    .delete(userId)
    .then(() => {
      res.clearCookie('authon_token');
      res.clearCookie('authon_refresh_token');
      res.redirect('/sign-in?deleted=1');
    })
    .catch((err: unknown) => {
      res.render('delete-account', {
        user: req.user,
        error: err instanceof Error ? err.message : 'Failed to delete account.',
        publishableKey: req.app.locals['publishableKey'],
        apiUrl: req.app.locals['apiUrl'],
      });
    });
});

export default router;
