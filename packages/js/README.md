**English** | [한국어](./README.ko.md)

# @authon/js

[![npm version](https://img.shields.io/npm/v/@authon/js?color=6d28d9)](https://www.npmjs.com/package/@authon/js)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

Core JavaScript SDK for [Authon](https://authon.dev). Works in any browser environment — no framework required.

Includes a built-in ShadowDOM sign-in modal, OAuth popup/redirect flows, passwordless auth, passkeys (WebAuthn), Web3 wallet login, TOTP-based MFA, and session management.

## Installation

```bash
npm install @authon/js
# or
pnpm add @authon/js
```

## Initialization

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_...');
```

With options:

```ts
const authon = new Authon('pk_live_...', {
  apiUrl: 'https://api.authon.dev',  // default
  mode: 'popup',                      // 'popup' | 'embedded'
  theme: 'auto',                      // 'light' | 'dark' | 'auto'
  locale: 'en',
  containerId: 'auth-container',      // element ID for embedded mode
  appearance: {                        // override project branding
    brandName: 'My App',
    primaryColorStart: '#7c3aed',
    primaryColorEnd: '#4f46e5',
    borderRadius: 12,
  },
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `string` | `https://api.authon.dev` | Authon API base URL |
| `mode` | `'popup' \| 'embedded'` | `'popup'` | Modal display mode |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `locale` | `string` | `'en'` | UI locale |
| `containerId` | `string` | — | Element ID for embedded mode |
| `appearance` | `Partial<BrandingConfig>` | — | Override branding from dashboard |

## Built-in Modal

```ts
// Open the Authon-hosted sign-in / sign-up modal
await authon.openSignIn();
await authon.openSignUp();
```

The modal renders inside a ShadowRoot, preventing CSS conflicts with your app. Branding is fetched from your Authon project settings and can be overridden via `appearance`.

## Email / Password

```ts
// Sign up a new user
const user = await authon.signUpWithEmail('user@example.com', 'password', {
  displayName: 'Alice',
});

// Sign in
const user = await authon.signInWithEmail('user@example.com', 'password');

// Sign out
await authon.signOut();
```

## OAuth

```ts
// Sign in with any supported provider
await authon.signInWithOAuth('google');
await authon.signInWithOAuth('apple');
await authon.signInWithOAuth('github');
await authon.signInWithOAuth('discord');
await authon.signInWithOAuth('facebook');
await authon.signInWithOAuth('microsoft');
await authon.signInWithOAuth('kakao');
await authon.signInWithOAuth('naver');
await authon.signInWithOAuth('line');
await authon.signInWithOAuth('x');

// Override the flow mode per call
await authon.signInWithOAuth('google', { flowMode: 'popup' });
await authon.signInWithOAuth('google', { flowMode: 'redirect' });
await authon.signInWithOAuth('google', { flowMode: 'auto' }); // default
```

The `auto` mode opens a popup and automatically falls back to a redirect if the popup is blocked.

## Passwordless

```ts
// Magic link — sends a sign-in link to the user's email
await authon.sendMagicLink('user@example.com');

// Email OTP — sends a one-time code to the user's email
await authon.sendEmailOtp('user@example.com');

// Verify magic link (token comes from URL query param after user clicks link)
const user = await authon.verifyPasswordless({ token: 'token-from-url' });

// Verify email OTP
const user = await authon.verifyPasswordless({
  email: 'user@example.com',
  code: '123456',
});
```

## Passkeys (WebAuthn)

```ts
// Register a new passkey — user must be signed in
const credential = await authon.registerPasskey('My MacBook');
// credential: { id, name, createdAt, lastUsedAt }

// Authenticate with a passkey (works before sign-in)
const user = await authon.authenticateWithPasskey();

// Restrict to passkeys registered for a specific email
const user = await authon.authenticateWithPasskey('user@example.com');

// List registered passkeys
const passkeys = await authon.listPasskeys();
// [{ id, name, createdAt, lastUsedAt }, ...]

// Rename a passkey
const updated = await authon.renamePasskey(passkeys[0].id, 'Work Laptop');

// Revoke (delete) a passkey
await authon.revokePasskey(passkeys[0].id);
```

## Web3

```ts
// Step 1: Request a sign-in nonce for a wallet address
const { message, nonce } = await authon.web3GetNonce(
  '0xAbc...123',  // wallet address
  'evm',           // 'evm' | 'solana'
  'metamask',      // wallet type
  1,               // chainId (optional, for EVM)
);

// Step 2: Sign the message with the wallet (MetaMask example)
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, '0xAbc...123'],
});

// Step 3: Verify the signature to sign in
const user = await authon.web3Verify(
  message,
  signature,
  '0xAbc...123',
  'evm',
  'metamask',
);

// Solana (Phantom) example
const { message } = await authon.web3GetNonce(
  phantomPublicKey.toString(),
  'solana',
  'phantom',
);
const encodedMessage = new TextEncoder().encode(message);
const { signature } = await window.solana.signMessage(encodedMessage, 'utf8');
const user = await authon.web3Verify(
  message,
  bs58.encode(signature),
  phantomPublicKey.toString(),
  'solana',
  'phantom',
);

// Link an additional wallet to the signed-in account
const wallet = await authon.linkWallet({
  address: '0xDef...456',
  chain: 'evm',
  walletType: 'walletconnect',
  chainId: 1,
  message,
  signature,
});
// wallet: { id, address, chain, walletType, chainId, createdAt }

// List linked wallets
const wallets = await authon.listWallets();

// Unlink a wallet
await authon.unlinkWallet(wallets[0].id);
```

**Supported wallet types:** `'metamask'` | `'pexus'` | `'walletconnect'` | `'coinbase'` | `'phantom'` | `'trust'` | `'other'`

**Supported chains:** `'evm'` | `'solana'`

## Multi-Factor Authentication (MFA)

Authon supports TOTP-based MFA compatible with Google Authenticator, Authy, and any other authenticator app.

### Setup

```ts
import { Authon } from '@authon/js';

// User must be signed in before calling setupMfa
const setup = await authon.setupMfa();
// setup.qrCodeSvg   — inline SVG string, render with innerHTML or as <img src>
// setup.qrCodeUri   — otpauth:// URI
// setup.secret      — raw TOTP secret
// setup.backupCodes — one-time recovery codes (save these!)

// Render the QR code
document.querySelector('#qr-container').innerHTML = setup.qrCodeSvg;

// User scans QR code, then enters the 6-digit code to confirm setup
await authon.verifyMfaSetup('123456');
```

### Sign-In With MFA

When MFA is enabled, `signInWithEmail` throws `AuthonMfaRequiredError`:

```ts
import { Authon, AuthonMfaRequiredError } from '@authon/js';

try {
  await authon.signInWithEmail('user@example.com', 'password');
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    // Prompt the user for their TOTP code
    const user = await authon.verifyMfa(err.mfaToken, '123456');
  }
}
```

Alternatively, use the event listener:

```ts
authon.on('mfaRequired', async (mfaToken) => {
  const code = prompt('Enter your authenticator code');
  if (code) await authon.verifyMfa(mfaToken, code);
});
```

### MFA Management

```ts
// Check current MFA status
const status = await authon.getMfaStatus();
// { enabled: true, backupCodesRemaining: 8 }

// Disable MFA (requires a valid TOTP code or backup code)
await authon.disableMfa('123456');

// Regenerate backup codes (requires a valid TOTP code)
const newCodes = await authon.regenerateBackupCodes('123456');
// ['XXXX-XXXX', 'XXXX-XXXX', ...]
```

## User Profile

```ts
// Get the currently signed-in user (synchronous, no network request)
const user = authon.getUser();
// {
//   id, projectId, email, displayName, avatarUrl, phone,
//   emailVerified, phoneVerified, isBanned,
//   publicMetadata, lastSignInAt, signInCount, createdAt, updatedAt
// }

// Get the current access token (synchronous)
const token = authon.getToken();

// Update profile fields
const updated = await authon.updateProfile({
  displayName: 'Alice Smith',
  avatarUrl: 'https://example.com/avatar.png',
  phone: '+12025551234',
  publicMetadata: { plan: 'pro', referralCode: 'ABC123' },
});
```

## Session Management

```ts
// List all active sessions for the signed-in user
const sessions = await authon.listSessions();
// [{ id, ipAddress, userAgent, createdAt, lastActiveAt }, ...]

// Revoke a specific session (e.g., sign out another device)
await authon.revokeSession(sessions[0].id);
```

## Events

`on()` returns an unsubscribe function.

```ts
// User signed in (after any auth method)
const off = authon.on('signedIn', (user) => {
  console.log('Signed in as', user.email);
});

// User signed out
authon.on('signedOut', () => {
  console.log('Signed out');
});

// Access token was silently refreshed
authon.on('tokenRefreshed', (token) => {
  // update token in your API client if needed
});

// MFA step required after email/password sign-in
authon.on('mfaRequired', (mfaToken) => {
  showMfaDialog(mfaToken);
});

// A new passkey was registered
authon.on('passkeyRegistered', (credential) => {
  console.log('Passkey registered:', credential.name);
});

// A Web3 wallet was linked
authon.on('web3Connected', (wallet) => {
  console.log('Wallet linked:', wallet.address, 'on', wallet.chain);
});

// An error occurred
authon.on('error', (error) => {
  console.error('Authon error:', error.message);
});

// Unsubscribe
off();
```

### Event Reference

| Event | Payload | Trigger |
|-------|---------|---------|
| `signedIn` | `AuthonUser` | Any successful sign-in |
| `signedOut` | — | `signOut()` called |
| `tokenRefreshed` | `string` | Access token silently refreshed |
| `mfaRequired` | `string` (mfaToken) | MFA required after password sign-in |
| `passkeyRegistered` | `PasskeyCredential` | `registerPasskey()` completed |
| `web3Connected` | `Web3Wallet` | `linkWallet()` completed |
| `error` | `Error` | Any error during auth flows |

## Full API Reference

### Auth Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `openSignIn()` | `Promise<void>` | Open the built-in sign-in modal |
| `openSignUp()` | `Promise<void>` | Open the built-in sign-up modal |
| `signInWithEmail(email, password)` | `Promise<AuthonUser>` | Sign in with email and password |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthonUser>` | Register a new account |
| `signInWithOAuth(provider, options?)` | `Promise<void>` | Start an OAuth flow |
| `signOut()` | `Promise<void>` | Sign out and clear session |
| `sendMagicLink(email)` | `Promise<void>` | Send a magic link to email |
| `sendEmailOtp(email)` | `Promise<void>` | Send an OTP code to email |
| `verifyPasswordless(options)` | `Promise<AuthonUser>` | Verify magic link token or OTP code |

### User & Session

| Method | Returns | Description |
|--------|---------|-------------|
| `getUser()` | `AuthonUser \| null` | Get current user (synchronous) |
| `getToken()` | `string \| null` | Get current access token (synchronous) |
| `updateProfile(data)` | `Promise<AuthonUser>` | Update displayName, avatarUrl, phone, publicMetadata |
| `listSessions()` | `Promise<SessionInfo[]>` | List all active sessions |
| `revokeSession(sessionId)` | `Promise<void>` | Revoke a session by ID |

### MFA

| Method | Returns | Description |
|--------|---------|-------------|
| `setupMfa()` | `Promise<MfaSetupResponse & { qrCodeSvg: string }>` | Begin MFA setup |
| `verifyMfaSetup(code)` | `Promise<void>` | Confirm setup with TOTP code |
| `verifyMfa(mfaToken, code)` | `Promise<AuthonUser>` | Complete sign-in with TOTP code |
| `getMfaStatus()` | `Promise<MfaStatus>` | Get MFA enabled state and backup code count |
| `disableMfa(code)` | `Promise<void>` | Disable MFA |
| `regenerateBackupCodes(code)` | `Promise<string[]>` | Generate new backup codes |

### Passkeys

| Method | Returns | Description |
|--------|---------|-------------|
| `registerPasskey(name?)` | `Promise<PasskeyCredential>` | Register a new passkey |
| `authenticateWithPasskey(email?)` | `Promise<AuthonUser>` | Sign in with a passkey |
| `listPasskeys()` | `Promise<PasskeyCredential[]>` | List registered passkeys |
| `renamePasskey(id, name)` | `Promise<PasskeyCredential>` | Rename a passkey |
| `revokePasskey(id)` | `Promise<void>` | Delete a passkey |

### Web3

| Method | Returns | Description |
|--------|---------|-------------|
| `web3GetNonce(address, chain, walletType, chainId?)` | `Promise<Web3NonceResponse>` | Get sign-in message and nonce |
| `web3Verify(message, signature, address, chain, walletType)` | `Promise<AuthonUser>` | Verify wallet signature and sign in |
| `listWallets()` | `Promise<Web3Wallet[]>` | List linked wallets |
| `linkWallet(params)` | `Promise<Web3Wallet>` | Link an additional wallet |
| `unlinkWallet(walletId)` | `Promise<void>` | Remove a linked wallet |

### Lifecycle

| Method | Returns | Description |
|--------|---------|-------------|
| `on(event, listener)` | `() => void` | Subscribe to an event, returns unsubscribe fn |
| `getProviders()` | `Promise<OAuthProviderType[]>` | List OAuth providers enabled for the project |
| `destroy()` | `void` | Clean up all listeners and resources |

## TypeScript

The SDK ships with full type declarations. Key types are exported from `@authon/shared`:

```ts
import type {
  AuthonUser,
  AuthTokens,
  MfaSetupResponse,
  MfaStatus,
  PasskeyCredential,
  Web3Wallet,
  Web3NonceResponse,
  SessionInfo,
  Web3Chain,
  Web3WalletType,
  OAuthProviderType,
} from '@authon/shared';

import type { AuthonConfig, AuthonEventType } from '@authon/js';
import { Authon, AuthonMfaRequiredError } from '@authon/js';
```

## Documentation

Full documentation: [docs.authon.dev](https://docs.authon.dev)

## License

[MIT](../../LICENSE)
