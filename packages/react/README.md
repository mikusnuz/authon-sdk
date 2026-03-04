**English** | [한국어](./README.ko.md)

# @authon/react

React components and hooks for [Authon](https://authon.dev) authentication.

## Install

```bash
npm install @authon/react @authon/js
# or
pnpm add @authon/react @authon/js
```

Requires `react >= 18.0.0`.

## Setup

Wrap your app with `<AuthonProvider>` at the root level:

```tsx
// src/main.tsx
import { AuthonProvider } from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <Router />
    </AuthonProvider>
  );
}
```

Get your publishable key from the [Authon Dashboard](https://authon.dev/dashboard).

---

## Components

### `<AuthonProvider>`

Initializes the Authon client and provides auth context to your entire component tree. Must wrap all other Authon components and hooks.

```tsx
import { AuthonProvider } from '@authon/react';

<AuthonProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authon.dev',
    theme: 'auto',
    locale: 'en',
    appearance: {
      primaryColorStart: '#7c3aed',
      primaryColorEnd: '#4f46e5',
      borderRadius: 12,
    },
  }}
>
  {children}
</AuthonProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `publishableKey` | `string` | Your project's publishable key |
| `config` | `AuthonConfig` (optional) | Additional client configuration |

---

### `<SignIn>`

Opens the sign-in modal or renders an embedded sign-in form.

```tsx
import { SignIn } from '@authon/react';

// Popup mode (default) — opens the modal immediately on mount
<SignIn mode="popup" />

// Embedded mode — renders a container div for the hosted form
<SignIn mode="embedded" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'popup' \| 'embedded'` | `'popup'` | Display mode |
| `redirectUrl` | `string` (optional) | — | URL to redirect after sign-in |

---

### `<SignUp>`

Opens the sign-up modal or renders an embedded sign-up form.

```tsx
import { SignUp } from '@authon/react';

// Popup mode (default)
<SignUp mode="popup" />

// Embedded mode
<SignUp mode="embedded" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'popup' \| 'embedded'` | `'popup'` | Display mode |

---

### `<UserButton>`

Displays a user avatar button. When clicked, opens a dropdown with the user's name, email, and a sign-out option. When the user is signed out, renders a "Sign In" button instead.

```tsx
import { UserButton } from '@authon/react';

function Navbar() {
  return (
    <nav>
      <UserButton />
    </nav>
  );
}
```

No props required.

---

### `<SignedIn>`

Renders `children` only when a user is signed in. Renders nothing while auth is loading.

```tsx
import { SignedIn } from '@authon/react';

<SignedIn>
  <Dashboard />
</SignedIn>
```

---

### `<SignedOut>`

Renders `children` only when no user is signed in. Renders nothing while auth is loading.

```tsx
import { SignedOut } from '@authon/react';

<SignedOut>
  <a href="/sign-in">Sign In</a>
</SignedOut>
```

---

### `<Protect>`

Guards content based on authentication status and an optional custom condition. Useful for role-based access control.

```tsx
import { Protect } from '@authon/react';

// Require sign-in only
<Protect fallback={<p>Please sign in to continue.</p>}>
  <PrivatePage />
</Protect>

// Require a specific role
<Protect
  fallback={<p>Admin access required.</p>}
  condition={(user) => user.publicMetadata?.role === 'admin'}
>
  <AdminPanel />
</Protect>
```

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render when access is granted |
| `fallback` | `ReactNode` (optional) | Content to render when access is denied |
| `condition` | `(user: AuthonUser) => boolean` (optional) | Additional check beyond sign-in status |

---

### `<SocialButton>`

A single OAuth provider button with built-in styles, icons, and loading state.

```tsx
import { SocialButton } from '@authon/react';

function SocialLogin() {
  const { client } = useAuthon();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SocialButton
        provider="google"
        onClick={async (provider) => {
          await client!.signInWithOAuth(provider);
        }}
      />
      <SocialButton
        provider="github"
        onClick={async (provider) => {
          await client!.signInWithOAuth(provider);
        }}
        compact
        size={48}
      />
    </div>
  );
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `provider` | `OAuthProviderType` | — | OAuth provider identifier |
| `onClick` | `(provider: OAuthProviderType) => void \| Promise<void>` | — | Click handler |
| `loading` | `boolean` | `false` | Show spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `label` | `string` (optional) | `"Continue with {Provider}"` | Override button label |
| `compact` | `boolean` | `false` | Icon-only square button |
| `className` | `string` (optional) | — | Custom class |
| `style` | `CSSProperties` (optional) | — | Custom inline style |
| `iconSize` | `number` (optional) | `20` (`24` in compact) | Icon size in px |
| `borderRadius` | `number` | `10` | Border radius in px |
| `height` | `number` | `48` | Button height in px (full mode) |
| `size` | `number` | `48` | Button size in px (compact mode) |

Supported `OAuthProviderType` values: `'google' | 'apple' | 'kakao' | 'naver' | 'facebook' | 'github' | 'discord' | 'x' | 'line' | 'microsoft'`

---

### `<SocialButtons>`

Automatically fetches your project's enabled OAuth providers and renders a list of `<SocialButton>` components. Handles OAuth sign-in flow internally.

```tsx
import { SocialButtons } from '@authon/react';

// Vertical list (default)
<SocialButtons
  onSuccess={() => console.log('Signed in!')}
  onError={(error) => console.error(error)}
/>

// Compact icon row
<SocialButtons
  compact
  gap={12}
  labels={{ google: 'Sign in with Google', kakao: '카카오로 로그인' }}
  buttonProps={{ borderRadius: 8 }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `() => void` (optional) | — | Called after successful OAuth sign-in |
| `onError` | `(error: Error) => void` (optional) | — | Called on OAuth error |
| `className` | `string` (optional) | — | Container class |
| `style` | `CSSProperties` (optional) | — | Container style |
| `gap` | `number` (optional) | `10` (`12` compact) | Gap between buttons in px |
| `compact` | `boolean` | `false` | Render icon-only buttons in a row |
| `labels` | `Partial<Record<OAuthProviderType, string>>` (optional) | — | Custom label per provider |
| `buttonProps` | `Partial<SocialButtonProps>` (optional) | — | Props forwarded to each `<SocialButton>` |

---

## Hooks

### `useAuthon()`

Returns the full auth context. Throws if used outside `<AuthonProvider>`.

```tsx
import { useAuthon } from '@authon/react';

function ProfileButton() {
  const { isSignedIn, isLoading, user, signOut, openSignIn, openSignUp, getToken, client } = useAuthon();

  if (isLoading) return <span>Loading...</span>;

  if (!isSignedIn) {
    return <button onClick={() => openSignIn()}>Sign In</button>;
  }

  return (
    <div>
      <span>Hello, {user?.displayName}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

**Return type:**

```ts
interface AuthonContextValue {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthonUser | null;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  client: Authon | null;
}
```

---

### `useUser()`

Shorthand hook that returns only the current user and loading state.

```tsx
import { useUser } from '@authon/react';

function WelcomeBanner() {
  const { user, isLoading } = useUser();

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;

  return <h2>Welcome back, {user.displayName ?? user.email}!</h2>;
}
```

**Return type:**

```ts
{
  user: AuthonUser | null;
  isLoading: boolean;
}
```

---

### `useAuthonMfa()`

Manages TOTP-based multi-factor authentication (Google Authenticator, Authy, etc.).

```tsx
import { useAuthonMfa } from '@authon/react';
import { useState } from 'react';

function MfaSetupPage() {
  const { setupMfa, verifyMfaSetup, disableMfa, getMfaStatus, regenerateBackupCodes, isLoading, error } = useAuthonMfa();
  const [qrSvg, setQrSvg] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');

  const handleSetup = async () => {
    const result = await setupMfa();
    if (result) {
      setQrSvg(result.qrCodeSvg);
      setBackupCodes(result.backupCodes);
    }
  };

  const handleVerify = async () => {
    const success = await verifyMfaSetup(code);
    if (success) alert('MFA enabled successfully!');
  };

  const handleCheckStatus = async () => {
    const status = await getMfaStatus();
    console.log('MFA enabled:', status?.enabled, 'Backup codes left:', status?.backupCodesRemaining);
  };

  return (
    <div>
      <button onClick={handleSetup} disabled={isLoading}>
        Enable MFA
      </button>

      {qrSvg && (
        <>
          <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p>Backup codes: {backupCodes.join(', ')}</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={handleVerify} disabled={isLoading}>
            Verify & Enable
          </button>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

**MFA sign-in flow (verifying TOTP after password):**

```tsx
import { useAuthon, useAuthonMfa } from '@authon/react';
import { AuthonMfaRequiredError } from '@authon/js';

function LoginForm() {
  const { client } = useAuthon();
  const { verifyMfa, isLoading } = useAuthonMfa();
  const [mfaToken, setMfaToken] = useState('');
  const [mfaStep, setMfaStep] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await client!.signInWithEmail(email, password);
      // signed in — no MFA required
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        setMfaToken(err.mfaToken);
        setMfaStep(true);
      }
    }
  };

  const handleMfa = async (code: string) => {
    const success = await verifyMfa(mfaToken, code);
    if (success) console.log('Signed in with MFA!');
  };

  // ...
}
```

**Return type:**

```ts
interface UseAuthonMfaReturn {
  setupMfa: () => Promise<(MfaSetupResponse & { qrCodeSvg: string }) | null>;
  verifyMfaSetup: (code: string) => Promise<boolean>;
  verifyMfa: (mfaToken: string, code: string) => Promise<boolean>;
  disableMfa: (code: string) => Promise<boolean>;
  getMfaStatus: () => Promise<MfaStatus | null>;
  regenerateBackupCodes: (code: string) => Promise<string[] | null>;
  isLoading: boolean;
  error: Error | null;
}
```

---

### `useAuthonPasskeys()`

Manages WebAuthn passkey registration and authentication.

```tsx
import { useAuthonPasskeys } from '@authon/react';

function PasskeySettings() {
  const {
    registerPasskey,
    authenticateWithPasskey,
    listPasskeys,
    renamePasskey,
    revokePasskey,
    isLoading,
    error,
  } = useAuthonPasskeys();

  const handleRegister = async () => {
    const passkey = await registerPasskey('My MacBook');
    if (passkey) {
      console.log('Passkey registered:', passkey.id);
    }
  };

  const handleList = async () => {
    const passkeys = await listPasskeys();
    console.log('Registered passkeys:', passkeys);
  };

  const handleRevoke = async (id: string) => {
    const success = await revokePasskey(id);
    if (success) console.log('Passkey revoked');
  };

  return (
    <div>
      <button onClick={handleRegister} disabled={isLoading}>
        Add Passkey
      </button>
      <button onClick={handleList} disabled={isLoading}>
        List Passkeys
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

**Return type:**

```ts
interface UseAuthonPasskeysReturn {
  registerPasskey: (name?: string) => Promise<PasskeyCredential | null>;
  authenticateWithPasskey: (email?: string) => Promise<boolean>;
  listPasskeys: () => Promise<PasskeyCredential[] | null>;
  renamePasskey: (id: string, name: string) => Promise<PasskeyCredential | null>;
  revokePasskey: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}
```

---

### `useAuthonPasswordless()`

Handles magic link and email OTP (one-time password) authentication flows.

```tsx
import { useAuthonPasswordless } from '@authon/react';
import { useState } from 'react';

function PasswordlessLogin() {
  const { sendMagicLink, sendEmailOtp, verifyPasswordless, isLoading, error } = useAuthonPasswordless();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');

  const handleSendOtp = async () => {
    const success = await sendEmailOtp(email);
    if (success) setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    const success = await verifyPasswordless({ email, code });
    if (success) console.log('Signed in!');
  };

  const handleMagicLink = async () => {
    const success = await sendMagicLink(email);
    if (success) alert('Check your email for a sign-in link!');
  };

  // Verify magic link token from URL
  const handleTokenVerify = async (token: string) => {
    const success = await verifyPasswordless({ token });
    if (success) console.log('Signed in via magic link!');
  };

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleMagicLink} disabled={isLoading}>Send Magic Link</button>
      <button onClick={handleSendOtp} disabled={isLoading}>Send OTP</button>

      {otpSent && (
        <>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
          <button onClick={handleVerifyOtp} disabled={isLoading}>Verify</button>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

**Return type:**

```ts
interface UseAuthonPasswordlessReturn {
  sendMagicLink: (email: string) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<boolean>;
  verifyPasswordless: (opts: { token?: string; email?: string; code?: string }) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}
```

---

### `useAuthonWeb3()`

Handles Web3 wallet authentication (Sign-In with Ethereum / Solana).

```tsx
import { useAuthonWeb3 } from '@authon/react';

function Web3Login() {
  const { getNonce, verify, listWallets, linkWallet, unlinkWallet, isLoading, error } = useAuthonWeb3();

  const handleSignIn = async () => {
    const address = '0xYourAddress';

    // 1. Get a nonce to sign
    const nonceResponse = await getNonce(address, 'evm', 'metamask', 1);
    if (!nonceResponse) return;

    // 2. Sign the message with your wallet (e.g. MetaMask)
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [nonceResponse.message, address],
    });

    // 3. Verify the signature to sign in
    const success = await verify(nonceResponse.message, signature, address, 'evm', 'metamask');
    if (success) console.log('Signed in with wallet!');
  };

  const handleLinkWallet = async () => {
    const address = '0xYourAddress';
    const nonceResponse = await getNonce(address, 'evm', 'metamask');
    if (!nonceResponse) return;

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [nonceResponse.message, address],
    });

    const wallet = await linkWallet({
      address,
      chain: 'evm',
      walletType: 'metamask',
      message: nonceResponse.message,
      signature,
    });

    if (wallet) console.log('Wallet linked:', wallet.id);
  };

  const handleListWallets = async () => {
    const wallets = await listWallets();
    console.log('Linked wallets:', wallets);
  };

  return (
    <div>
      <button onClick={handleSignIn} disabled={isLoading}>Sign In with MetaMask</button>
      <button onClick={handleLinkWallet} disabled={isLoading}>Link Wallet</button>
      <button onClick={handleListWallets} disabled={isLoading}>List Wallets</button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

**Return type:**

```ts
interface UseAuthonWeb3Return {
  getNonce: (
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ) => Promise<Web3NonceResponse | null>;
  verify: (
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ) => Promise<boolean>;
  listWallets: () => Promise<Web3Wallet[] | null>;
  linkWallet: (params: LinkWalletParams) => Promise<Web3Wallet | null>;
  unlinkWallet: (walletId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

interface LinkWalletParams {
  address: string;
  chain: Web3Chain;
  walletType: Web3WalletType;
  chainId?: number;
  message: string;
  signature: string;
}

type Web3Chain = 'evm' | 'solana';
type Web3WalletType = 'metamask' | 'pexus' | 'walletconnect' | 'coinbase' | 'phantom' | 'trust' | 'other';
```

---

### `useAuthonSessions()`

Lists and revokes active user sessions.

```tsx
import { useAuthonSessions } from '@authon/react';
import { useEffect, useState } from 'react';
import type { SessionInfo } from '@authon/shared';

function SessionManager() {
  const { listSessions, revokeSession, isLoading, error } = useAuthonSessions();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    listSessions().then((s) => {
      if (s) setSessions(s);
    });
  }, []);

  const handleRevoke = async (sessionId: string) => {
    const success = await revokeSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  if (isLoading) return <p>Loading sessions...</p>;

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          <span>{session.userAgent ?? 'Unknown device'}</span>
          <span>{session.ipAddress}</span>
          <button onClick={() => handleRevoke(session.id)}>Revoke</button>
        </li>
      ))}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </ul>
  );
}
```

**Return type:**

```ts
interface UseAuthonSessionsReturn {
  listSessions: () => Promise<SessionInfo[] | null>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}
```

---

## TypeScript Types

Key types exported from `@authon/react` and `@authon/shared`:

```ts
import type {
  AuthonContextValue,
  SocialButtonProps,
  SocialButtonsProps,
  UseAuthonMfaReturn,
  UseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn,
  UseAuthonWeb3Return,
  LinkWalletParams,
  UseAuthonSessionsReturn,
} from '@authon/react';

import type {
  AuthonUser,
  SessionInfo,
  PasskeyCredential,
  Web3Wallet,
  Web3NonceResponse,
  MfaSetupResponse,
  MfaStatus,
  OAuthProviderType,
  Web3Chain,
  Web3WalletType,
} from '@authon/shared';
```

---

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
