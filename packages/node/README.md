# @authon/node

Node.js server SDK for [Authon](https://authon.dev) — verify tokens, manage users, and validate webhooks.

## Install

```bash
npm install @authon/node
# or
pnpm add @authon/node
```

## Quick Start

### Token Verification

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');

const user = await authon.verifyToken(accessToken);
console.log(user.id, user.email);
```

### Express Middleware

```ts
import express from 'express';
import { expressMiddleware } from '@authon/node';

const app = express();

app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  // req.auth is the verified AuthonUser
  res.json({ user: req.auth });
});
```

### Fastify Plugin

```ts
import Fastify from 'fastify';
import { fastifyPlugin } from '@authon/node';

const app = Fastify();

app.addHook('onRequest', fastifyPlugin({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (request, reply) => {
  reply.send({ user: request.auth });
});
```

### User Management

```ts
const authon = new AuthonBackend('sk_live_...');

// List users
const { data, total } = await authon.users.list({ page: 1, limit: 20 });

// Get a user
const user = await authon.users.get('user_abc123');

// Create a user
const newUser = await authon.users.create({
  email: 'new@example.com',
  password: 'securePassword',
  displayName: 'New User',
});

// Update a user
await authon.users.update('user_abc123', {
  displayName: 'Updated Name',
  publicMetadata: { role: 'admin' },
});

// Ban / unban
await authon.users.ban('user_abc123', 'Violation of ToS');
await authon.users.unban('user_abc123');

// Delete a user
await authon.users.delete('user_abc123');
```

### Webhook Verification

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');

app.post('/webhooks/authon', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-authon-signature'] as string;
  try {
    const event = authon.webhooks.verify(req.body, signature, process.env.WEBHOOK_SECRET!);
    console.log('Event:', event);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});
```

## API Reference

### `AuthonBackend`

| Method | Returns | Description |
|--------|---------|-------------|
| `verifyToken(token)` | `Promise<AuthonUser>` | Verify an access token |
| `users.list(options?)` | `Promise<ListResult<AuthonUser>>` | List users with pagination |
| `users.get(id)` | `Promise<AuthonUser>` | Get a user by ID |
| `users.create(data)` | `Promise<AuthonUser>` | Create a user |
| `users.update(id, data)` | `Promise<AuthonUser>` | Update a user |
| `users.delete(id)` | `Promise<void>` | Delete a user |
| `users.ban(id, reason?)` | `Promise<AuthonUser>` | Ban a user |
| `users.unban(id)` | `Promise<AuthonUser>` | Unban a user |
| `webhooks.verify(payload, signature, secret)` | `Record<string, unknown>` | Verify webhook HMAC-SHA256 signature |

### Middleware

| Export | Description |
|--------|-------------|
| `expressMiddleware(options)` | Express/Connect middleware, sets `req.auth` |
| `fastifyPlugin(options)` | Fastify onRequest hook, sets `request.auth` |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
