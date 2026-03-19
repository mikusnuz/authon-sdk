import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function apiHeaders(token: string, publishableKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': publishableKey,
    Authorization: `Bearer ${token}`,
  };
}

router.get('/', (req: Request, res: Response) => {
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  fetch(`${apiUrl}/v1/auth/mfa/status`, {
    headers: apiHeaders(token, publishableKey),
  })
    .then(async (r) => {
      if (!r.ok) return { enabled: false, backupCodesRemaining: 0 };
      return r.json() as Promise<{ enabled: boolean; backupCodesRemaining: number }>;
    })
    .then((mfaStatus) => {
      res.render('mfa', {
        user: req.user,
        mfaStatus,
        setupData: null,
        error: null,
        success: null,
        publishableKey,
        apiUrl,
      });
    })
    .catch(() => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: false, backupCodesRemaining: 0 },
        setupData: null,
        error: 'Failed to load MFA status.',
        success: null,
        publishableKey,
        apiUrl,
      });
    });
});

router.post('/setup', (req: Request, res: Response) => {
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  fetch(`${apiUrl}/v1/auth/mfa/totp/setup`, {
    method: 'POST',
    headers: apiHeaders(token, publishableKey),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(`API ${r.status}`);
      return r.json() as Promise<{ secret: string; qrCodeUri: string; backupCodes: string[] }>;
    })
    .then((setupData) => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: false, backupCodesRemaining: 0 },
        setupData,
        error: null,
        success: null,
        publishableKey,
        apiUrl,
      });
    })
    .catch((err: unknown) => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: false, backupCodesRemaining: 0 },
        setupData: null,
        error: err instanceof Error ? err.message : 'Failed to start MFA setup.',
        success: null,
        publishableKey,
        apiUrl,
      });
    });
});

router.post('/verify', (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  fetch(`${apiUrl}/v1/auth/mfa/totp/verify-setup`, {
    method: 'POST',
    headers: apiHeaders(token, publishableKey),
    body: JSON.stringify({ code }),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error('Invalid verification code.');
    })
    .then(() => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: true, backupCodesRemaining: 8 },
        setupData: null,
        error: null,
        success: 'Two-factor authentication enabled successfully.',
        publishableKey,
        apiUrl,
      });
    })
    .catch((err: unknown) => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: false, backupCodesRemaining: 0 },
        setupData: null,
        error: err instanceof Error ? err.message : 'Verification failed.',
        success: null,
        publishableKey,
        apiUrl,
      });
    });
});

router.post('/disable', (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  const token = req.cookies['authon_token'] as string;
  const apiUrl = req.app.locals['apiUrl'] as string;
  const publishableKey = req.app.locals['publishableKey'] as string;

  fetch(`${apiUrl}/v1/auth/mfa/disable`, {
    method: 'POST',
    headers: apiHeaders(token, publishableKey),
    body: JSON.stringify({ code }),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error('Invalid code or MFA not enabled.');
    })
    .then(() => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: false, backupCodesRemaining: 0 },
        setupData: null,
        error: null,
        success: 'Two-factor authentication disabled.',
        publishableKey,
        apiUrl,
      });
    })
    .catch((err: unknown) => {
      res.render('mfa', {
        user: req.user,
        mfaStatus: { enabled: true, backupCodesRemaining: 0 },
        setupData: null,
        error: err instanceof Error ? err.message : 'Failed to disable MFA.',
        success: null,
        publishableKey,
        apiUrl,
      });
    });
});

export default router;
