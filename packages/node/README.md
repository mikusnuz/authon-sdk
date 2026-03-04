**English** | [한국어](./README.ko.md)

# @authon/node

Server-side SDK for [Authon](https://authon.dev). Token verification, user management, session management, and webhook verification.

## Install

```bash
npm install @authon/node
```

## Initialize

```typescript
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');
```

### Configuration options

```typescript
const authon = new AuthonBackend('sk_live_...', {
  apiUrl: 'https://api.authon.dev', // optional, defaults to https://api.authon.dev
});
```

---

## Token Verification

Verify an access token issued by Authon and retrieve the authenticated user.

```typescript
const user = await authon.verifyToken(accessToken);
// Returns AuthonUser:
// {
//   id: string
//   projectId: string
//   email: string | null
//   displayName: string | null
//   avatarUrl: string | null
//   phone: string | null
//   emailVerified: boolean
//   phoneVerified: boolean
//   isBanned: boolean
//   publicMetadata: Record<string, unknown> | null
//   lastSignInAt: string | null
//   signInCount: number
//   createdAt: string
//   updatedAt: string
// }
```

---

## Users

### List users

```typescript
const result = await authon.users.list({ page: 1, limit: 20, search: 'alice' });
// Returns: { data: AuthonUser[], total: number, page: number, limit: number }

for (const user of result.data) {
  console.log(user.id, user.email);
}
```

| Option   | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| `page`   | `number` | Page number (1-based)                |
| `limit`  | `number` | Results per page                     |
| `search` | `string` | Filter by email or display name      |

### Get a user

```typescript
const user = await authon.users.get('usr_...');
```

### Get user by external ID

```typescript
const user = await authon.users.getByExternalId('your-db-id-123');
```

### Create a user

```typescript
const user = await authon.users.create({
  email: 'alice@example.com',
  password: 'secret1234',           // optional — omit for OAuth-only users
  displayName: 'Alice',             // optional
  externalId: 'your-db-id-123',    // optional — link to your own record
  provider: 'google',               // optional
  avatarUrl: 'https://cdn.example.com/avatar.png', // optional
  phone: '+821012345678',           // optional
  emailVerified: true,              // optional, default false
  publicMetadata: { role: 'admin' },    // optional — visible to clients
  privateMetadata: { plan: 'pro' },     // optional — server-only
});
```

### Update a user

```typescript
const user = await authon.users.update('usr_...', {
  displayName: 'Alice Smith',
  externalId: 'new-external-id',
  avatarUrl: 'https://cdn.example.com/new-avatar.png',
  phone: '+821098765432',
  emailVerified: true,
  publicMetadata: { role: 'moderator' },
  privateMetadata: { notes: 'VIP customer' },
});
```

### Delete a user

```typescript
await authon.users.delete('usr_...');
```

### Ban a user

```typescript
const user = await authon.users.ban('usr_...', 'Violated terms of service');
// reason is optional
```

### Unban a user

```typescript
const user = await authon.users.unban('usr_...');
```

---

## Sessions

### List user sessions

```typescript
const sessions = await authon.sessions.list('usr_...');
// Returns SessionInfo[]:
// [{
//   id: string
//   ipAddress: string | null
//   userAgent: string | null
//   createdAt: string
//   lastActiveAt: string | null
// }]
```

### Revoke a session

```typescript
await authon.sessions.revoke('usr_...', 'sess_...');
```

---

## Webhooks

Authon sends signed webhook events to your endpoint. Verify the signature with `webhooks.verify` before processing the event.

The method uses HMAC-SHA256 with timing-safe comparison. It throws an error if the signature is invalid, and returns the parsed payload on success.

```typescript
const event = authon.webhooks.verify(
  rawBody,        // string | Buffer — raw request body (do not parse JSON first)
  signature,      // value of the X-Authon-Signature header, format: "v1=<hex>"
  timestamp,      // value of the X-Authon-Timestamp header (ISO 8601)
  webhookSecret,  // your webhook signing secret from the Authon dashboard
);

console.log(event.type); // e.g. "user.created"
```

### Express.js webhook handler

```typescript
import express from 'express';
import { AuthonBackend } from '@authon/node';

const app = express();
const authon = new AuthonBackend('sk_live_...');

// Use express.raw() — JSON must not be pre-parsed for signature verification
app.post('/webhooks/authon', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-authon-signature'] as string;
  const timestamp = req.headers['x-authon-timestamp'] as string;

  try {
    const event = authon.webhooks.verify(
      req.body,
      signature,
      timestamp,
      process.env.AUTHON_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case 'user.created':
        console.log('New user:', event.data);
        break;
      case 'user.updated':
        console.log('User updated:', event.data);
        break;
      case 'user.deleted':
        console.log('User deleted:', event.data);
        break;
      case 'user.banned':
        console.log('User banned:', event.data);
        break;
      case 'session.created':
        console.log('Session created:', event.data);
        break;
      case 'session.revoked':
        console.log('Session revoked:', event.data);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

---

## Framework Examples

### Express.js auth middleware

Build a custom middleware that verifies the token and attaches the user to `req.auth`.

```typescript
import express from 'express';
import { AuthonBackend } from '@authon/node';
import type { AuthonUser } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');

declare global {
  namespace Express {
    interface Request {
      auth?: AuthonUser;
    }
  }
}

async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  try {
    req.auth = await authon.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

const app = express();
app.use(express.json());

app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ user: req.auth });
});
```

Or use the built-in `expressMiddleware` helper:

```typescript
import { expressMiddleware } from '@authon/node';

app.use(
  '/api',
  expressMiddleware({
    secretKey: process.env.AUTHON_SECRET_KEY!,
    onError: (err) => console.error(err),
  }),
);
```

### Next.js API route

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await authon.verifyToken(token);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

```typescript
// app/api/users/route.ts (admin endpoint)
import { NextRequest, NextResponse } from 'next/server';
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || undefined;

  const result = await authon.users.list({ page, limit: 20, search });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await authon.users.create(body);
  return NextResponse.json(user, { status: 201 });
}
```

### Fastify plugin

```typescript
import Fastify from 'fastify';
import { fastifyPlugin } from '@authon/node';

const app = Fastify();

const authHook = fastifyPlugin({
  secretKey: process.env.AUTHON_SECRET_KEY!,
  onError: (err) => app.log.error(err),
});

app.addHook('onRequest', authHook);

app.get('/api/profile', async (request) => {
  return { user: request.auth };
});
```

---

## API Reference

### `AuthonBackend`

| Method | Returns | Description |
|---|---|---|
| `verifyToken(token)` | `Promise<AuthonUser>` | Verify an access token |
| `users.list(options?)` | `Promise<ListResult<AuthonUser>>` | Paginated user list |
| `users.get(userId)` | `Promise<AuthonUser>` | Get user by ID |
| `users.getByExternalId(externalId)` | `Promise<AuthonUser>` | Get user by external ID |
| `users.create(data)` | `Promise<AuthonUser>` | Create a user |
| `users.update(userId, data)` | `Promise<AuthonUser>` | Update a user |
| `users.delete(userId)` | `Promise<void>` | Delete a user |
| `users.ban(userId, reason?)` | `Promise<AuthonUser>` | Ban a user |
| `users.unban(userId)` | `Promise<AuthonUser>` | Unban a user |
| `sessions.list(userId)` | `Promise<SessionInfo[]>` | List sessions for a user |
| `sessions.revoke(userId, sessionId)` | `Promise<void>` | Revoke a specific session |
| `webhooks.verify(payload, signature, timestamp, secret)` | `Record<string, unknown>` | Verify webhook HMAC-SHA256 signature |

### Middleware helpers

| Export | Description |
|---|---|
| `expressMiddleware(options)` | Express/Connect middleware — sets `req.auth` to the verified user |
| `fastifyPlugin(options)` | Fastify `onRequest` hook — sets `request.auth` to the verified user |

### `AuthonMiddlewareOptions`

| Field | Type | Description |
|---|---|---|
| `secretKey` | `string` | Your Authon secret key (`sk_live_...`) |
| `apiUrl` | `string` | Optional custom API base URL |
| `onError` | `(err: Error) => void` | Optional error callback |

---

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
