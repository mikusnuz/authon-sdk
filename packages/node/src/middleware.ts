import type { AuthupUser } from '@authup/shared';
import { AuthupBackend } from './authup';

export interface AuthupMiddlewareOptions {
  secretKey: string;
  apiUrl?: string;
  onError?: (error: Error) => void;
}

export function expressMiddleware(options: AuthupMiddlewareOptions) {
  const client = new AuthupBackend(options.secretKey, { apiUrl: options.apiUrl });

  return async (
    req: { headers: Record<string, string | string[] | undefined>; auth?: AuthupUser },
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

export function fastifyPlugin(options: AuthupMiddlewareOptions) {
  const client = new AuthupBackend(options.secretKey, { apiUrl: options.apiUrl });

  return async (
    request: { headers: Record<string, string | string[] | undefined>; auth?: AuthupUser },
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
