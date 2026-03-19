**English** | [한국어](./README.ko.md)

# @authon/shared

> Shared types and constants for all Authon SDKs — self-hosted Clerk alternative

[![npm version](https://img.shields.io/npm/v/@authon/shared?color=6d28d9)](https://www.npmjs.com/package/@authon/shared)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

Internal package consumed by `@authon/js`, `@authon/react`, `@authon/node`, and all other Authon SDKs. Not intended for direct application use -- install the appropriate framework SDK instead.

## Install

```bash
npm install @authon/shared
```

## Quick Start

```ts
import type {
  AuthonUser,
  AuthTokens,
  OAuthProviderType,
  PasskeyCredential,
  Web3Wallet,
  MfaSetupResponse,
  SessionInfo,
  BrandingConfig,
  WebhookEvent,
  AuthonOrganization,
} from '@authon/shared';

import {
  OAUTH_PROVIDERS,
  PROVIDER_DISPLAY_NAMES,
  PROVIDER_COLORS,
  WEBHOOK_EVENTS,
  API_KEY_PREFIXES,
  DEFAULT_BRANDING,
  DEFAULT_SESSION_CONFIG,
  AUDIT_EVENTS,
} from '@authon/shared';
```

## Common Tasks

### Import User Type

```ts
import type { AuthonUser } from '@authon/shared';

function greet(user: AuthonUser) {
  return `Hello, ${user.displayName ?? user.email}`;
}
```

### Get Provider Colors for Custom Buttons

```ts
import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES } from '@authon/shared';

const google = PROVIDER_COLORS.google;
// { bg: '#ffffff', text: '#1f1f1f' }

const label = PROVIDER_DISPLAY_NAMES.google;
// 'Google'
```

### Check API Key Type

```ts
import { API_KEY_PREFIXES } from '@authon/shared';

function isSecretKey(key: string) {
  return key.startsWith(API_KEY_PREFIXES.SECRET_LIVE) || key.startsWith(API_KEY_PREFIXES.SECRET_TEST);
}
```

## Environment Variables

Not applicable -- this is a types-only package. See the framework-specific SDK for environment variable setup.

## API Reference

### Types

| Type | Description |
|------|-------------|
| `AuthonUser` | User object (id, email, displayName, avatarUrl, metadata, etc.) |
| `AuthTokens` | `{ accessToken, refreshToken, expiresIn, user }` |
| `OAuthProviderType` | `'google' \| 'apple' \| 'github' \| 'discord' \| ... (10 providers)` |
| `PasskeyCredential` | `{ id, name, createdAt, lastUsedAt }` |
| `Web3Wallet` | `{ id, address, chain, walletType, chainId }` |
| `Web3Chain` | `'evm' \| 'solana'` |
| `Web3WalletType` | `'metamask' \| 'phantom' \| 'walletconnect' \| ...` |
| `MfaSetupResponse` | `{ secret, qrCodeUri, backupCodes }` |
| `MfaStatus` | `{ enabled, backupCodesRemaining }` |
| `SessionInfo` | `{ id, ipAddress, userAgent, createdAt, lastActiveAt }` |
| `BrandingConfig` | Visual customization for the auth modal |
| `WebhookEvent` | `{ id, type, projectId, timestamp, data }` |
| `AuthonOrganization` | Organization with id, name, slug, members |

### Constants

| Constant | Value |
|----------|-------|
| `OAUTH_PROVIDERS` | `['google', 'apple', 'kakao', 'naver', 'facebook', 'github', 'discord', 'x', 'line', 'microsoft']` |
| `WEBHOOK_EVENTS` | `['user.created', 'user.updated', 'user.deleted', ...]` |
| `API_KEY_PREFIXES` | `{ PUBLISHABLE_LIVE: 'pk_live_', SECRET_LIVE: 'sk_live_', ... }` |
| `DEFAULT_BRANDING` | Default modal theme colors and settings |
| `DEFAULT_SESSION_CONFIG` | `{ accessTokenTtl: 900, refreshTokenTtl: 604800, maxSessions: 5 }` |
| `AUDIT_EVENTS` | Audit log event type constants |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| Shared types package | Yes | Yes | No |
| OAuth providers | 10+ | 20+ | 80+ |

## License

MIT
