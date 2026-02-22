# @authon/shared

Shared types and constants for [Authon](https://authon.dev) SDKs.

## Install

```bash
npm install @authon/shared
# or
pnpm add @authon/shared
```

## Usage

```ts
import type {
  AuthonUser,
  AuthonSession,
  AuthTokens,
  BrandingConfig,
  WebhookEvent,
} from '@authon/shared';

import {
  OAUTH_PROVIDERS,
  PROVIDER_DISPLAY_NAMES,
  PROVIDER_COLORS,
  WEBHOOK_EVENTS,
  API_KEY_PREFIXES,
  DEFAULT_BRANDING,
  DEFAULT_SESSION_CONFIG,
} from '@authon/shared';
```

## API Reference

### Types

| Type | Description |
|------|-------------|
| `AuthonUser` | User object with id, email, displayName, avatarUrl, etc. |
| `AuthonSession` | Active session with userId, ipAddress, expiresAt |
| `AuthTokens` | Token response: accessToken, refreshToken, expiresIn, user |
| `BrandingConfig` | Visual customization: colors, logo, border radius, locale |
| `SessionConfig` | TTL settings, max sessions, single session mode |
| `WebhookEvent` | Webhook payload: id, type, projectId, timestamp, data |
| `OAuthProviderType` | Union of supported OAuth providers |
| `WebhookEventType` | Union of webhook event types |

### Constants

| Constant | Description |
|----------|-------------|
| `OAUTH_PROVIDERS` | Array of supported providers: google, apple, kakao, naver, ... |
| `PROVIDER_DISPLAY_NAMES` | Human-readable provider names |
| `PROVIDER_COLORS` | Brand colors (bg, text) per provider |
| `WEBHOOK_EVENTS` | All webhook event types |
| `API_KEY_PREFIXES` | Key prefixes: `pk_live_`, `pk_test_`, `sk_live_`, `sk_test_` |
| `DEFAULT_BRANDING` | Default branding configuration |
| `DEFAULT_SESSION_CONFIG` | Default session settings (15min access, 7d refresh) |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
