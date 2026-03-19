import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import type { SessionInfo } from '@authon/shared';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  fetch(`${apiUrl}/v1/auth/me/sessions`, {
    headers: {
      'x-api-key': publishableKey,
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(`API ${r.status}`);
      return r.json() as Promise<SessionInfo[]>;
    })
    .then((sessions) => {
      res.render('sessions', {
        user: req.user,
        sessions,
        error: null,
        success: null,
        publishableKey,
        apiUrl,
      });
    })
    .catch((err: unknown) => {
      res.render('sessions', {
        user: req.user,
        sessions: [],
        error: err instanceof Error ? err.message : 'Failed to load sessions.',
        success: null,
        publishableKey,
        apiUrl,
      });
    });
});

router.post('/revoke', (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId?: string };
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  if (!sessionId) {
    res.redirect('/sessions');
    return;
  }

  fetch(`${apiUrl}/v1/auth/me/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': publishableKey,
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (r) => {
      if (!r.ok && r.status !== 204) throw new Error(`API ${r.status}`);
    })
    .then(() => {
      res.redirect('/sessions?revoked=1');
    })
    .catch(() => {
      res.redirect('/sessions?error=1');
    });
});

export default router;
