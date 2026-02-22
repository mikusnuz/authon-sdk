import type { AuthonUser } from '@authon/shared';
import { AuthonBackend } from './authon';

export interface AuthonMiddlewareOptions {
  secretKey: string;
  apiUrl?: string;
  onError?: (error: Error) => void;
}

export function expressMiddleware(options: AuthonMiddlewareOptions) {
  const client = new AuthonBackend(options.secretKey, { apiUrl: options.apiUrl });

  return async (
    req: { headers: Record<string, string | string[] | undefined>; auth?: AuthonUser },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void,
  ) => {
    const authHeader = req.headers['authorization'];
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    try {
      req.auth = await client.verifyToken(token);
      next();
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function fastifyPlugin(options: AuthonMiddlewareOptions) {
  const client = new AuthonBackend(options.secretKey, { apiUrl: options.apiUrl });

  return async (
    request: { headers: Record<string, string | string[] | undefined>; auth?: AuthonUser },
    reply: { code: (code: number) => { send: (body: unknown) => void } },
  ) => {
    const authHeader = request.headers['authorization'];
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      reply.code(401).send({ error: 'Missing authorization header' });
      return;
    }

    try {
      request.auth = await client.verifyToken(token);
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      reply.code(401).send({ error: 'Invalid token' });
    }
  };
}
