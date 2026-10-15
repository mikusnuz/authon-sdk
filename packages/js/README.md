**English** | [한국어](./README.ko.md)

# @authon/js

> Drop-in browser authentication SDK — Auth0 alternative, open-source auth

[![npm version](https://img.shields.io/npm/v/@authon/js?color=6d28d9)](https://www.npmjs.com/package/@authon/js)
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

    const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY');

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

const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY');

// Opens popup, falls back to redirect if blocked
await authon.signInWithOAuth('google');

// Force redirect mode
await authon.signInWithOAuth('google', { flowMode: 'redirect' });

// Supported providers: google, apple, github, discord, facebook,
// microsoft, kakao, naver, line, x
```

How the OAuth result reaches your page (0.9.1+):

- The SDK creates a PKCE verifier for every sign-in and sends Authon only its SHA-256 hash.
- After the provider login, Authon hands the browser a one-time code (60 seconds, single use). It never hands it raw tokens.
- Popup: the code is posted only to the exact origin that started sign-in. If the popup lost its opener (cross-origin isolation or Safari), it returns to your page and passes the code to the waiting tab through same-origin storage.
- Redirect: the code comes back to your page as `?authon_code=...&authon_oauth_state=...`. The SDK removes both parameters as soon as it loads.
- The SDK exchanges code + verifier at `POST /v1/auth/oauth/token`. `GET /v1/auth/oauth/poll` only reports `pending`, `completed` or `error`.
- Your page's origin must be listed in the project's **Allowed Origins** (or set as its domain). Authon refuses to start OAuth from any other origin.

### Add Email/Password Auth

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY');

// Sign up
const user = await authon.signUpWithEmail('user@example.com', 'MyP@ssw0rd', {
  displayName: 'Alice',
});

// Sign in (sign-up has the same verification challenge shape)
const result = await authon.signInWithEmail('user@example.com', 'MyP@ssw0rd');
if ('needsVerification' in result) {
  const user = await authon.verifyEmail(result.email, '123456');
}
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

### Embedded Wallet

A non-custodial EVM wallet created for the signed-in user without any UI. Enable wallets for the project in the Authon console first (Advanced > Embedded wallets).

Each wallet is an HD wallet: a BIP39 seed split into three shares (this device, Authon, passkey backup); any two can sign and Authon alone cannot. The EVM account is derived at `m/44'/60'/0'/0/0`. The seed never leaves the wallet frame on `wallet.authon.dev`.

```ts
const authon = new Authon('pk_live_...', { wallet: { autoCreate: true } });

authon.wallet.onChange((wallet) => render(wallet));
authon.on('walletError', (err) => console.warn(err.code));

const wallet = await authon.wallet.ensure();          // { address, protected, needsRestore, devices }
const signature = await authon.wallet.signMessage('hello');

// protect() and restore() show one small confirmation card from the wallet frame, then the
// system passkey prompt (browsers require a tap inside the wallet frame). Set its text/colors:
button.onclick = () => authon.wallet.protect({
  ui: { title: 'Secure your account', confirmLabel: 'Continue with Face ID', accentColor: '#16a34a' },
});
restoreButton.onclick = () => authon.wallet.restore(); // when wallet.needsRestore is true; other devices keep working
lostDeviceButton.onclick = () => authon.wallet.restore({ resetOtherDevices: true }); // a device was lost

const provider = authon.wallet.provider(1);           // EIP-1193: eth_accounts, eth_requestAccounts,
                                                      // eth_chainId, personal_sign,
                                                      // eth_signTypedData_v4, eth_signTransaction
```

Default card text and colors can be set once with `new Authon(pk, { wallet: { ui: { ... } } })`. In BFF mode (`sessionMode: 'bff'`) pass `wallet.getToken`, a function that returns a short-lived wallet token minted on your server with `createAuthonWalletToken` from `@authon/nextjs/server`.

**Do not let users receive funds before `wallet.protected` is true** (`await authon.wallet.isProtected()`). Until `protect()` creates the passkey backup, the wallet exists only as this browser's share plus Authon's share: clearing site data, Safari's storage eviction or a lost device makes it unrecoverable.

Every `signMessage`, `signTypedData` and `signTransaction` needs the user's approval, and resolves only after it. Low-risk requests (personal messages, typed data that grants nothing) show a card inside the wallet frame with the requesting site and the full text; Sign is enabled once the text was scrolled to the end, and text longer than 16,384 characters is refused with `MESSAGE_TOO_LARGE`. High-risk requests (transactions with value or call data, token approvals, permits, Permit2, orders, meta-transactions) show a small card whose button opens an Authon window (`https://wallet.authon.dev/confirm`); the user reviews and approves there, outside your page. The click happens inside the wallet frame, so these methods do not have to run in a click handler. A rejection throws `USER_CANCELLED`, a blocked or closed window `CONFIRM_WINDOW_BLOCKED` / `CONFIRM_WINDOW_CLOSED`; none of them signs. Approval can be turned off only per project in the console's wallet settings, not from the page. The wallet frame refuses to sign messages that start with `create:`, `device:` or `restore:` and typed data under the "Authon Wallet Proof" domain, which are reserved for wallet key proofs.

`revokeDevice()` must run in a browser that holds a device share (the request is signed with it), and the last device of an unprotected wallet cannot be revoked (`LAST_DEVICE`). In BFF mode, pass the user's Authon access token to `createAuthonWalletToken({ accessToken })`: creating, restoring and revoking need a session-bound token (`SESSION_REQUIRED` otherwise). The production wallet frame can only be embedded by `https://` pages, and only by the page itself: if your page is inside another site's iframe, the wallet frame does not load.

When `wallet.backupUpgradeRecommended` is true the passkey backup predates server-verified restores. Offer a button that calls `await authon.wallet.upgradeBackup()` (from a click, on a browser where `needsRestore` is false): it creates a new passkey backup; other devices and sites restore once with the new passkey.

`wallet.origin` defaults to `https://wallet.authon.dev` with the default `apiUrl`; set it explicitly when using a custom `apiUrl`. Other provider methods throw an error with code `4200`. Wallet failures are thrown as `AuthonWalletError` with a `code` (`NOT_FOUND`, `NEEDS_RESTORE`, `NOT_PROTECTED`, `PRF_UNSUPPORTED`, `ORIGIN_NOT_ALLOWED`, `USER_CANCELLED`, `TIMEOUT`, `NEEDS_POPUP`, `POPUP_BLOCKED`, `NOT_SIGNED_IN`, `NOT_CONFIGURED`, `LAST_DEVICE`, `SESSION_REQUIRED`, `STORAGE_UNAVAILABLE`, `CONFIRM_WINDOW_BLOCKED`, `CONFIRM_WINDOW_CLOSED`, `MESSAGE_TOO_LARGE`, `FRAME_OUTDATED`, `BACKUP_KEY_REQUIRED`, `ALREADY_UPGRADED`).

## Security

### Token storage

In the default browser mode (`sessionMode: 'browser'`), the SDK keeps the access token and refresh token in `localStorage` so sessions survive page reloads. Any script that runs on your origin can read `localStorage`. An XSS bug in your app, or a compromised third-party script, can steal the tokens and use them until they expire.

Each refresh token is single-use. A refresh rotates it, and the old token is rejected afterwards.

**Use BFF mode when your project has embedded wallets** or other high-value actions. With `sessionMode: 'bff'`, the SDK never reads or writes browser token storage. Your server holds the Authon tokens in an HttpOnly session, and the wallet gets short-lived, wallet-only tokens through `wallet.getToken` (minted with `createAuthonWalletToken` from `@authon/nextjs/server`). See [BFF authentication with Authorization Code + PKCE](https://github.com/mikusnuz/authon-sdk/blob/main/docs/bff-authorization-code-pkce.md).

If you stay in browser mode, use a strict Content Security Policy, keep third-party scripts to a minimum, and keep access-token TTLs short.

### Branding and profile rendering

The sign-in modal and profile UI escape every project branding value and user field before rendering. Terms and privacy links must be absolute `http(s)` URLs. Logos must be base64 `data:image/(png|jpeg|gif|webp|svg+xml)` URLs and are rendered only through `<img>`. Colors must be hex, `rgb[a]()` or `hsl[a]()`. Custom CSS goes into its own `<style>` element as text, with `</style` sequences removed. Invalid values are dropped and the defaults are used.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key (`pk_live_...` or `pk_test_...`) |
| `AUTHON_API_URL` | No | Optional — defaults to `api.authon.dev` |

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
| `signInWithEmail(email, password)` | `Promise<AuthonUser \| { needsVerification: true; email: string }>`; throws `AuthonMfaRequiredError` when MFA is required |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthonUser>` |
| `signInWithOAuth(provider, options?)` | `Promise<void>` |
| `signOut()` | `Promise<void>` |
| `getUser()` | `AuthonUser \| null` |
| `getToken()` | `string \| null` |

### Passwordless

| Method | Returns |
|--------|---------|
| `sendMagicLink(email, { redirectUrl? })` | `Promise<void>` |
| `sendEmailOtp(email)` | `Promise<void>` |
| `verifyPasswordless({ token?, email?, code? })` | `Promise<AuthonUser>` |
| `handleMagicLink()` | `Promise<AuthonUser \| null>` |
| `getPendingMagicLink()` | `{ email, reason } \| null` |
| `confirmMagicLink()` | `Promise<AuthonUser>` |
| `dismissMagicLink()` | `void` |

Magic links open the project's callback URL/domain at `/auth/verify` when one is set, otherwise the page that requested them. Links requested by this SDK carry the token in the URL fragment (`#authon_magic_link=1&token=...`) on every target, including `/auth/verify`, so it never reaches your server, proxies or logs; read it in the browser (the SDK does). Only requests without the SDK's browser value (older SDKs, direct API calls) still get `?token=...&authon_magic_link=1`, and the SDK keeps reading that form. A custom server-side `/auth/verify` route that reads `?token=` must move to client-side handling. With `autoHandleMagicLink` (default `true`) the SDK removes the link from the URL right away and finishes sign-in on page load. Set it to `false` and call `handleMagicLink()` yourself if you need control. Choose "magic link" or "6-digit code" per project in the console (Sign-in methods > Passwordless); the API rejects the other method with `AUTH_METHOD_DISABLED`.

A link signs in **silently only in the browser that requested it** (the SDK keeps a random value in `localStorage` and sends it with the request) **and only when nobody is signed in yet**. Otherwise, for example a link opened on another device, requested by an older SDK, or sent to you by someone else, nothing is signed in and the SDK fires `magicLinkConfirmationRequired`. Ask the person before you continue:

```ts
authon.on('magicLinkConfirmationRequired', ({ email, reason }) => {
  // reason: 'unrecognized_browser' (another browser/device) or 'signed_in' (would replace the current session)
  if (confirm(`Sign in as ${email}?`)) authon.confirmMagicLink();
  else authon.dismissMagicLink();
});
// or, after `await authon.handleMagicLink()` resolved to null:
const pending = authon.getPendingMagicLink();
```

Email codes: a code is checked only against the newest code requested from the same IP (otherwise the newest code). Sending a new code or link cancels earlier links and the codes requested from that IP. Each code allows 5 tries, at most 3 of them from other IPs, so a stranger cannot use up the owner's tries. Repeated wrong codes add short waits (HTTP 429 `PASSWORDLESS_RETRY_LATER` with `retryAfter` seconds, up to 60 s). Sends are limited to 3 per address per 10 minutes (HTTP 429 `PASSWORDLESS_SEND_LIMITED`); after 10 wrong codes for an address within an hour, new codes are spaced 5 minutes apart and allow 3 tries (1 from other IPs). There is no long lockout.

If the account has TOTP MFA, magic link, email code and Web3 sign-in end like password sign-in: the `mfaRequired` event fires and the call rejects with `AuthonMfaRequiredError`; finish with `verifyMfa(error.mfaToken, code)`. In authorization code (BFF) mode the request stays open and `verifyMfa()` completes it. Passkey sign-in already requires user verification on the device and does not ask again.

Sign-in methods that are turned off in the console are rejected by the API with `AUTH_METHOD_DISABLED` (passwordless, passkeys and Web3), not only hidden in the modal.

### Passkeys (WebAuthn)

| Method | Returns |
|--------|---------|
| `registerPasskey(name?)` | `Promise<PasskeyCredential>` |
| `authenticateWithPasskey(email?)` | `Promise<AuthonUser>` |
| `listPasskeys()` | `Promise<PasskeyCredential[]>` |
| `renamePasskey(id, name)` | `Promise<PasskeyCredential>` |
| `revokePasskey(id)` | `Promise<void>` |

`authenticateWithPasskey` signs in with discoverable passkeys. The `email` argument is still accepted but no longer narrows the list of credentials, so the API does not reveal which addresses have an account or passkeys.

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
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| ShadowDOM modal | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |
| Organizations | Yes | Yes | No |

## License

MIT
