import type { Request, Response, NextFunction } from 'express';
import type { AuthonUser } from '@authon/shared';
import { AuthonBackend } from '@authon/node';

declare global {
  namespace Express {
    interface Request {
      user?: AuthonUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies['authon_token'] as string | undefined;

  if (!token) {
    res.redirect('/sign-in');
    return;
  }

  const authon = req.app.locals['authon'] as AuthonBackend;

  authon
    .verifyToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      res.clearCookie('authon_token');
      res.redirect('/sign-in');
    });
}
