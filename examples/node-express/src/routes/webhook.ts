import { Router } from 'express';
import express from 'express';
import type { Request, Response } from 'express';
import { AuthonBackend } from '@authon/node';

const router = Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response) => {
    const signature = req.headers['x-authon-signature'] as string | undefined;
    const timestamp = req.headers['x-authon-timestamp'] as string | undefined;
    const secret = process.env.AUTHON_WEBHOOK_SECRET;

    if (!signature || !timestamp || !secret) {
      res.status(400).json({ error: 'Missing webhook headers or secret' });
      return;
    }

    const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY ?? '', {
      apiUrl: process.env.AUTHON_API_URL,
    });

    try {
      const event = authon.webhooks.verify(
        req.body as Buffer,
        signature,
        timestamp,
        secret,
      );

      console.log('Authon webhook event:', event['type'], event);

      res.json({ received: true });
    } catch {
      res.status(400).json({ error: 'Invalid webhook signature' });
    }
  },
);

export default router;
