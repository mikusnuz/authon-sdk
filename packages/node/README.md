# @authup/node

Node.js server SDK for [Authup](https://authup.dev) — verify tokens, manage users, and validate webhooks.

## Install

```bash
npm install @authup/node
# or
pnpm add @authup/node
```

## Quick Start

### Token Verification

```ts
import { AuthupBackend } from '@authup/node';

const authup = new AuthupBackend('sk_live_...');

const user = await authup.verifyToken(accessToken);
console.log(user.id, user.email);
```

### Express Middleware

```ts
import express from 'express';
import { expressMiddleware } from '@authup/node';

const app = express();

app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHUP_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  // req.auth is the verified AuthupUser
  res.json({ user: req.auth });
});
```

### Fastify Plugin

```ts
import Fastify from 'fastify';
import { fastifyPlugin } from '@authup/node';

const app = Fastify();

app.addHook('onRequest', fastifyPlugin({
  secretKey: process.env.AUTHUP_SECRET_KEY!,
}));

app.get('/api/profile', (request, reply) => {
  reply.send({ user: request.auth });
});
```

### User Management

```ts
const authup = new AuthupBackend('sk_live_...');

// List users
const { data, total } = await authup.users.list({ page: 1, limit: 20 });

// Get a user
const user = await authup.users.get('user_abc123');

// Create a user
const newUser = await authup.users.create({
  email: 'new@example.com',
  password: 'securePassword',
  displayName: 'New User',
});

// Update a user
await authup.users.update('user_abc123', {
  displayName: 'Updated Name',
  publicMetadata: { role: 'admin' },
});

// Ban / unban
await authup.users.ban('user_abc123', 'Violation of ToS');
await authup.users.unban('user_abc123');

// Delete a user
await authup.users.delete('user_abc123');
```

### Webhook Verification

```ts
import { AuthupBackend } from '@authup/node';

const authup = new AuthupBackend('sk_live_...');

app.post('/webhooks/authup', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-authup-signature'] as string;
  try {
    const event = authup.webhooks.verify(req.body, signature, process.env.WEBHOOK_SECRET!);
    console.log('Event:', event);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});
```

## API Reference

### `AuthupBackend`

| Method | Returns | Description |
|--------|---------|-------------|
| `verifyToken(token)` | `Promise<AuthupUser>` | Verify an access token |
| `users.list(options?)` | `Promise<ListResult<AuthupUser>>` | List users with pagination |
| `users.get(id)` | `Promise<AuthupUser>` | Get a user by ID |
| `users.create(data)` | `Promise<AuthupUser>` | Create a user |
| `users.update(id, data)` | `Promise<AuthupUser>` | Update a user |
| `users.delete(id)` | `Promise<void>` | Delete a user |
| `users.ban(id, reason?)` | `Promise<AuthupUser>` | Ban a user |
| `users.unban(id)` | `Promise<AuthupUser>` | Unban a user |
| `webhooks.verify(payload, signature, secret)` | `Record<string, unknown>` | Verify webhook HMAC-SHA256 signature |

### Middleware

| Export | Description |
|--------|-------------|
| `expressMiddleware(options)` | Express/Connect middleware, sets `req.auth` |
| `fastifyPlugin(options)` | Fastify onRequest hook, sets `request.auth` |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
