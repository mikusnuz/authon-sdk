**English** | [한국어](./README.ko.md)

# @authon/shared

[![npm version](https://img.shields.io/npm/v/@authon/shared?color=6d28d9)](https://www.npmjs.com/package/@authon/shared)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

Shared types and constants for [Authon](https://authon.dev) SDK packages. This package is consumed internally by `@authon/js`, `@authon/react`, `@authon/node`, and all other Authon SDKs.

> **Note:** This package is not intended for direct use in application code. Install the appropriate framework SDK instead (e.g., `@authon/js`, `@authon/react`, `@authon/node`).

## Installation

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
  SessionConfig,
  WebhookEvent,
  MfaSetupResponse,
  MfaStatus,
  PasskeyCredential,
  Web3Wallet,
  Web3NonceResponse,
  SessionInfo,
  Web3Chain,
  Web3WalletType,
  OAuthProviderType,
  WebhookEventType,
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

## Exported Types

### Core

#### `AuthonUser`

The authenticated user object.

```ts
interface AuthonUser {
  id: string;
  projectId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isBanned: boolean;
  publicMetadata: Record<string, unknown> | null;
  lastSignInAt: string | null;
  signInCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### `AuthonSession`

An active user session record (from the server SDK).

```ts
interface AuthonSession {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  expiresAt: string;
}
```

#### `AuthTokens`

Token pair returned after a successful sign-in.

```ts
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: AuthonUser;
}
```

#### `SessionInfo`

Simplified session info returned to clients (used in `listSessions()`).

```ts
interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string | null;
}
```

### Branding & Config

#### `BrandingConfig`

Visual customization options for the Authon modal.

```ts
interface BrandingConfig {
  logoDataUrl?: string;
  brandName?: string;
  primaryColorStart?: string;
  primaryColorEnd?: string;
  lightBg?: string;
  lightText?: string;
  darkBg?: string;
  darkText?: string;
  borderRadius?: number;
  providerOrder?: string[];
  hiddenProviders?: string[];
  showEmailPassword?: boolean;
  showDivider?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  customCss?: string;
  locale?: string;
  showSecuredBy?: boolean;
}
```

#### `SessionConfig`

Session lifetime and concurrency settings.

```ts
interface SessionConfig {
  accessTokenTtl?: number;   // seconds, default 900 (15 min)
  refreshTokenTtl?: number;  // seconds, default 604800 (7 days)
  maxSessions?: number;      // default 5
  singleSession?: boolean;   // default false
}
```

### MFA

#### `MfaSetupResponse`

Returned by `setupMfa()`.

```ts
interface MfaSetupResponse {
  secret: string;      // TOTP secret
  qrCodeUri: string;   // otpauth:// URI
  backupCodes: string[]; // one-time recovery codes
}
```

#### `MfaStatus`

Returned by `getMfaStatus()`.

```ts
interface MfaStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}
```

### Passkeys

#### `PasskeyCredential`

A registered WebAuthn passkey.

```ts
interface PasskeyCredential {
  id: string;
  name: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}
```

### Web3

#### `Web3Chain`

```ts
type Web3Chain = 'evm' | 'solana';
```

#### `Web3WalletType`

```ts
type Web3WalletType =
  | 'metamask'
  | 'pexus'
  | 'walletconnect'
  | 'coinbase'
  | 'phantom'
  | 'trust'
  | 'other';
```

#### `Web3Wallet`

A linked Web3 wallet.

```ts
interface Web3Wallet {
  id: string;
  address: string;
  chain: Web3Chain;
  walletType: Web3WalletType;
  chainId: number | null;
  createdAt: string;
}
```

#### `Web3NonceResponse`

Returned by `web3GetNonce()`.

```ts
interface Web3NonceResponse {
  message: string; // full message to sign
  nonce: string;   // raw nonce embedded in message
}
```

### Webhooks

#### `WebhookEvent`

Incoming webhook payload from Authon.

```ts
interface WebhookEvent {
  id: string;
  type: string;
  projectId: string;
  timestamp: string;
  data: Record<string, unknown>;
}
```

#### `WebhookEventType`

```ts
type WebhookEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.banned'
  | 'user.unbanned'
  | 'session.created'
  | 'session.ended'
  | 'session.revoked'
  | 'provider.linked'
  | 'provider.unlinked';
```

### OAuth

#### `OAuthProviderType`

```ts
type OAuthProviderType =
  | 'google'
  | 'apple'
  | 'kakao'
  | 'naver'
  | 'facebook'
  | 'github'
  | 'discord'
  | 'x'
  | 'line'
  | 'microsoft';
```

## Exported Constants

### `OAUTH_PROVIDERS`

Readonly array of all supported OAuth provider identifiers.

```ts
const OAUTH_PROVIDERS: readonly OAuthProviderType[];
// ['google', 'apple', 'kakao', 'naver', 'facebook', 'github', 'discord', 'x', 'line', 'microsoft']
```

### `PROVIDER_DISPLAY_NAMES`

Human-readable names for each provider.

```ts
const PROVIDER_DISPLAY_NAMES: Record<OAuthProviderType, string>;
// { google: 'Google', apple: 'Apple', github: 'GitHub', discord: 'Discord', ... }
```

### `PROVIDER_COLORS`

Official brand colors (background and text) for each provider button.

```ts
const PROVIDER_COLORS: Record<OAuthProviderType, { bg: string; text: string }>;
// { google: { bg: '#ffffff', text: '#1f1f1f' }, kakao: { bg: '#FEE500', text: '#191919' }, ... }
```

### `WEBHOOK_EVENTS`

Readonly array of all webhook event type strings.

```ts
const WEBHOOK_EVENTS: readonly WebhookEventType[];
```

### `API_KEY_PREFIXES`

Prefix strings for Authon API keys.

```ts
const API_KEY_PREFIXES: {
  PUBLISHABLE_LIVE: 'pk_live_';
  PUBLISHABLE_TEST: 'pk_test_';
  SECRET_LIVE: 'sk_live_';
  SECRET_TEST: 'sk_test_';
};
```

### `DEFAULT_BRANDING`

Default branding values applied when no project customization is set.

```ts
const DEFAULT_BRANDING: BrandingConfig;
// { primaryColorStart: '#7c3aed', primaryColorEnd: '#4f46e5', borderRadius: 12, ... }
```

### `DEFAULT_SESSION_CONFIG`

Default session lifetime and concurrency settings.

```ts
const DEFAULT_SESSION_CONFIG: SessionConfig;
// { accessTokenTtl: 900, refreshTokenTtl: 604800, maxSessions: 5, singleSession: false }
```

## Documentation

Full documentation: [docs.authon.dev](https://docs.authon.dev)

## License

[MIT](../../LICENSE)
