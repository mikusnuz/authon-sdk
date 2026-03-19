import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  res.render('profile', {
    user: req.user,
    success: null,
    error: null,
    publishableKey: req.app.locals['publishableKey'],
    apiUrl: req.app.locals['apiUrl'],
  });
});

router.post('/', (req: Request, res: Response) => {
  const { displayName, avatarUrl, phone } = req.body as {
    displayName?: string;
    avatarUrl?: string;
    phone?: string;
  };

  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  const payload: Record<string, string> = {};
  if (displayName) payload['displayName'] = displayName;
  if (avatarUrl) payload['avatarUrl'] = avatarUrl;
  if (phone) payload['phone'] = phone;

  fetch(`${apiUrl}/v1/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': publishableKey,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(`API ${r.status}`);
      return r.json();
    })
    .then((user) => {
      res.render('profile', {
        user,
        success: 'Profile updated successfully.',
        error: null,
        publishableKey,
        apiUrl,
      });
    })
    .catch((err: unknown) => {
      res.render('profile', {
        user: req.user,
        success: null,
        error: err instanceof Error ? err.message : 'Failed to update profile.',
        publishableKey,
        apiUrl,
      });
    });
});

export default router;
