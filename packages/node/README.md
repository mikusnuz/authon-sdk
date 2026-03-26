**English** | [한국어](./README.ko.md)

> **Deprecated:** Authon is a frontend authentication platform. This package is no longer maintained. Use the frontend SDKs instead.

# @authon/node

> Node.js server SDK for token verification, user management, and webhooks — Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/node?color=6d28d9)](https://www.npmjs.com/package/@authon/node)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...`) — use in your frontend code
   - **Test Key** (`pk_test_...`) — for development, enables Dev Teleport

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Install

```bash
npm install @authon/node
```

## Quick Start

```ts
// server.ts — complete working Express server
import express from 'express';
import { AuthonBackend, expressMiddleware } from '@authon/node';

const app = express();
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

// Protect all /api routes
app.use('/api', expressMiddleware({ secretKey: process.env.AUTHON_SECRET_KEY! }));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

app.get('/api/users', async (req, res) => {
  const result = await authon.users.list({ page: 1, limit: 20 });
  res.json(result);
});

app.listen(3000);
```

## Common Tasks

### Verify a Token

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_YOUR_SECRET_KEY');
const user = await authon.verifyToken(accessToken);
// { id, email, displayName, avatarUrl, emailVerified, ... }
```

### Protect Express Routes

```ts
import { expressMiddleware } from '@authon/node';

app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
  onError: (err) => console.error(err),
}));

// req.auth is now the verified AuthonUser
app.get('/api/me', (req, res) => res.json(req.auth));
```

### Protect Fastify Routes

```ts
import { fastifyPlugin } from '@authon/node';

app.addHook('onRequest', fastifyPlugin({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));
```

### Manage Users

```ts
const authon = new AuthonBackend('sk_live_...');

// List
const result = await authon.users.list({ page: 1, limit: 20, search: 'alice' });

// Create
const user = await authon.users.create({
  email: 'alice@example.com',
  password: 'secret1234',
  displayName: 'Alice',
});

// Update
await authon.users.update('usr_...', { displayName: 'Alice Smith' });

// Ban / Unban
await authon.users.ban('usr_...', 'Spam');
await authon.users.unban('usr_...');

// Delete
await authon.users.delete('usr_...');
```

### Verify Webhooks

```ts
app.post('/webhooks/authon', express.raw({ type: 'application/json' }), (req, res) => {
  const event = authon.webhooks.verify(
    req.body,
    req.headers['x-authon-signature'] as string,
    req.headers['x-authon-timestamp'] as string,
    process.env.AUTHON_WEBHOOK_SECRET!,
  );
  console.log(event.type); // "user.created", "session.revoked", etc.
  res.json({ received: true });
});
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...` or `sk_test_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |
| `AUTHON_WEBHOOK_SECRET` | For webhooks | Webhook signing secret |

## API Reference

### AuthonBackend

| Method | Returns |
|--------|---------|
| `verifyToken(token)` | `Promise<AuthonUser>` |
| `users.list(options?)` | `Promise<ListResult<AuthonUser>>` |
| `users.get(userId)` | `Promise<AuthonUser>` |
| `users.getByExternalId(externalId)` | `Promise<AuthonUser>` |
| `users.create(data)` | `Promise<AuthonUser>` |
| `users.update(userId, data)` | `Promise<AuthonUser>` |
| `users.delete(userId)` | `Promise<void>` |
| `users.ban(userId, reason?)` | `Promise<AuthonUser>` |
| `users.unban(userId)` | `Promise<AuthonUser>` |
| `sessions.list(userId)` | `Promise<SessionInfo[]>` |
| `sessions.revoke(userId, sessionId)` | `Promise<void>` |
| `webhooks.verify(payload, signature, timestamp, secret)` | `Record<string, unknown>` |
| `organizations.list()` | `Promise<OrganizationListResponse>` |
| `organizations.create(params)` | `Promise<AuthonOrganization>` |
| `auditLogs.list(params?)` | `Promise<AuditLogListResponse>` |
| `jwtTemplates.list()` | `Promise<JwtTemplate[]>` |

### Middleware

| Export | Description |
|--------|-------------|
| `expressMiddleware(options)` | Express middleware, sets `req.auth` |
| `fastifyPlugin(options)` | Fastify hook, sets `request.auth` |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Pricing | Free | $25/mo+ | Free |
| Server SDK | Yes | Yes | Partial |
| User management API | Yes | Yes | No |
| Webhook verification | Yes | Yes | No |
| Audit logs | Yes | Enterprise | No |
| Organizations | Yes | Yes | No |

## License

MIT
