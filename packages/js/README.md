**English** | [한국어](./README.ko.md)

# @authon/js

> Drop-in browser authentication SDK — self-hosted Clerk alternative, Auth0 alternative, open-source auth

[![npm version](https://img.shields.io/npm/v/@authon/js?color=6d28d9)](https://www.npmjs.com/package/@authon/js)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Install

```bash
npm install @authon/js
```

## Quick Start

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body>
  <button id="sign-in-btn">Sign In</button>
  <div id="user-info"></div>

  <script type="module">
    import { Authon } from '@authon/js';

    const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY', {
      apiUrl: 'https://your-authon-server.com',
    });

    document.getElementById('sign-in-btn').addEventListener('click', () => {
      authon.openSignIn();
    });

    authon.on('signedIn', (user) => {
      document.getElementById('user-info').textContent = `Hello, ${user.email}`;
      document.getElementById('sign-in-btn').style.display = 'none';
    });
  </script>
</body>
</html>
```

## Common Tasks

### Add Google OAuth Login

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY', {
  apiUrl: 'https://your-authon-server.com',
});

// Opens popup, falls back to redirect if blocked
await authon.signInWithOAuth('google');

// Force redirect mode
await authon.signInWithOAuth('google', { flowMode: 'redirect' });

// Supported providers: google, apple, github, discord, facebook,
// microsoft, kakao, naver, line, x
```

### Add Email/Password Auth

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY', {
  apiUrl: 'https://your-authon-server.com',
});

// Sign up
const user = await authon.signUpWithEmail('user@example.com', 'MyP@ssw0rd', {
  displayName: 'Alice',
});

// Sign in
const user = await authon.signInWithEmail('user@example.com', 'MyP@ssw0rd');
```

### Get Current User

```ts
// Synchronous — no network request
const user = authon.getUser();
// { id, email, displayName, avatarUrl, emailVerified, ... }

const token = authon.getToken();
// Use token for authenticated API calls
```

### Open Built-in Sign-In Modal

```ts
// ShadowDOM modal — no CSS conflicts with your app
await authon.openSignIn();
await authon.openSignUp();
```

### Handle Sign Out

```ts
await authon.signOut();
```

### Add Passkey (WebAuthn) Login

```ts
// Register passkey (user must be signed in)
const credential = await authon.registerPasskey('My MacBook');

// Sign in with passkey
const user = await authon.authenticateWithPasskey();
```

### Add Web3 Wallet Login (MetaMask)

```ts
const { message } = await authon.web3GetNonce('0xAbc...', 'evm', 'metamask', 1);
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, '0xAbc...'],
});
const user = await authon.web3Verify(message, signature, '0xAbc...', 'evm', 'metamask');
```

### Add MFA (TOTP)

```ts
import { Authon, AuthonMfaRequiredError } from '@authon/js';

// Setup MFA (user must be signed in)
const setup = await authon.setupMfa();
document.getElementById('qr').innerHTML = setup.qrCodeSvg;
await authon.verifyMfaSetup('123456'); // code from authenticator app

// Sign in with MFA
try {
  await authon.signInWithEmail('user@example.com', 'password');
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    const user = await authon.verifyMfa(err.mfaToken, '123456');
  }
}
```

### Listen to Auth Events

```ts
authon.on('signedIn', (user) => console.log('Signed in:', user.email));
authon.on('signedOut', () => console.log('Signed out'));
authon.on('error', (err) => console.error(err.message));
authon.on('mfaRequired', (mfaToken) => { /* show MFA dialog */ });
authon.on('tokenRefreshed', (token) => { /* update API client */ });
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_API_URL` | Yes | Your Authon server URL (e.g. `https://your-authon-server.com`) |
| `AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key (`pk_live_...` or `pk_test_...`) |

## API Reference

### Constructor

```ts
new Authon(publishableKey: string, config?: AuthonConfig)
```

| Config Option | Type | Default | Description |
|--------------|------|---------|-------------|
| `apiUrl` | `string` | `https://api.authon.dev` | API base URL |
| `mode` | `'popup' \| 'embedded'` | `'popup'` | Modal display mode |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `locale` | `string` | `'en'` | UI locale |
| `containerId` | `string` | -- | Element ID for embedded mode |
| `appearance` | `Partial<BrandingConfig>` | -- | Override branding |

### Auth Methods

| Method | Returns |
|--------|---------|
| `openSignIn()` | `Promise<void>` |
| `openSignUp()` | `Promise<void>` |
| `signInWithEmail(email, password)` | `Promise<AuthonUser>` |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthonUser>` |
| `signInWithOAuth(provider, options?)` | `Promise<void>` |
| `signOut()` | `Promise<void>` |
| `getUser()` | `AuthonUser \| null` |
| `getToken()` | `string \| null` |

### Passwordless

| Method | Returns |
|--------|---------|
| `sendMagicLink(email)` | `Promise<void>` |
| `sendEmailOtp(email)` | `Promise<void>` |
| `verifyPasswordless({ token?, email?, code? })` | `Promise<AuthonUser>` |

### Passkeys (WebAuthn)

| Method | Returns |
|--------|---------|
| `registerPasskey(name?)` | `Promise<PasskeyCredential>` |
| `authenticateWithPasskey(email?)` | `Promise<AuthonUser>` |
| `listPasskeys()` | `Promise<PasskeyCredential[]>` |
| `renamePasskey(id, name)` | `Promise<PasskeyCredential>` |
| `revokePasskey(id)` | `Promise<void>` |

### Web3

| Method | Returns |
|--------|---------|
| `web3GetNonce(address, chain, walletType, chainId?)` | `Promise<Web3NonceResponse>` |
| `web3Verify(message, signature, address, chain, walletType)` | `Promise<AuthonUser>` |
| `listWallets()` | `Promise<Web3Wallet[]>` |
| `linkWallet(params)` | `Promise<Web3Wallet>` |
| `unlinkWallet(walletId)` | `Promise<void>` |

### MFA

| Method | Returns |
|--------|---------|
| `setupMfa()` | `Promise<MfaSetupResponse & { qrCodeSvg }>` |
| `verifyMfaSetup(code)` | `Promise<void>` |
| `verifyMfa(mfaToken, code)` | `Promise<AuthonUser>` |
| `getMfaStatus()` | `Promise<MfaStatus>` |
| `disableMfa(code)` | `Promise<void>` |
| `regenerateBackupCodes(code)` | `Promise<string[]>` |

### Organizations

| Method | Returns |
|--------|---------|
| `organizations.list()` | `Promise<OrganizationListResponse>` |
| `organizations.create(params)` | `Promise<AuthonOrganization>` |
| `organizations.get(orgId)` | `Promise<AuthonOrganization>` |
| `organizations.update(orgId, params)` | `Promise<AuthonOrganization>` |
| `organizations.delete(orgId)` | `Promise<void>` |
| `organizations.invite(orgId, params)` | `Promise<OrganizationInvitation>` |

### Events

| Event | Payload |
|-------|---------|
| `signedIn` | `AuthonUser` |
| `signedOut` | -- |
| `tokenRefreshed` | `string` |
| `mfaRequired` | `string` (mfaToken) |
| `passkeyRegistered` | `PasskeyCredential` |
| `web3Connected` | `Web3Wallet` |
| `error` | `Error` |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| ShadowDOM modal | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |
| Organizations | Yes | Yes | No |

## License

MIT
