[English](./README.md) | **한국어**

# @authon/react

[Authon](https://authon.dev)용 React SDK — Provider, 훅, 사전 빌드된 컴포넌트를 제공합니다.

## 설치

```bash
npm install @authon/react
# 또는
pnpm add @authon/react
```

`react >= 18.0.0`이 필요합니다.

## 빠른 시작

```tsx
import {
  AuthonProvider,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useAuthon,
} from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <Header />
      <Main />
    </AuthonProvider>
  );
}

function Header() {
  return (
    <nav>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </nav>
  );
}

function SignInButton() {
  const { openSignIn } = useAuthon();
  return <button onClick={() => openSignIn()}>Sign In</button>;
}

function Main() {
  const { user, isLoading } = useUser();
  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>Please sign in.</p>;
  return <h1>Welcome, {user.displayName}</h1>;
}
```

## API 레퍼런스

### `<AuthonProvider>`

앱을 감싸며 인증 컨텍스트를 제공합니다.

```tsx
<AuthonProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authon.dev',
    theme: 'auto',
    locale: 'en',
    appearance: { primaryColorStart: '#7c3aed' },
  }}
>
  {children}
</AuthonProvider>
```

### 훅

#### `useAuthon()`

전체 인증 컨텍스트를 반환합니다.

```ts
const {
  isSignedIn,  // boolean
  isLoading,   // boolean
  user,        // AuthonUser | null
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
  client,      // Authon instance
} = useAuthon();
```

#### `useUser()`

사용자 데이터 간단 접근용 훅입니다.

```ts
const { user, isLoading } = useUser();
```

### 컴포넌트

| 컴포넌트 | Props | 설명 |
|---------|-------|------|
| `<SignedIn>` | `children` | 로그인 상태일 때만 자식 컴포넌트를 렌더링합니다 |
| `<SignedOut>` | `children` | 로그아웃 상태일 때만 자식 컴포넌트를 렌더링합니다 |
| `<UserButton>` | 없음 | 로그아웃 액션이 포함된 아바타 드롭다운입니다 |
| `<SignIn>` | `mode?` | 로그인 모달을 열거나 인라인 폼을 렌더링합니다 |
| `<SignUp>` | `mode?` | 회원가입 모달을 열거나 인라인 폼을 렌더링합니다 |
| `<Protect>` | `fallback?`, `condition?` | 콘텐츠를 보호하며, 선택적으로 커스텀 조건을 지정할 수 있습니다 |

### `<Protect>` 사용 예시

```tsx
<Protect
  fallback={<p>You need admin access.</p>}
  condition={(user) => user.publicMetadata?.role === 'admin'}
>
  <AdminPanel />
</Protect>
```

## 다중 인증 (MFA)

`useAuthonMfa` 훅을 사용하여 TOTP 기반 MFA(Google Authenticator, Authy 등)를 관리합니다.

### MFA 설정

```tsx
import { useAuthonMfa } from '@authon/react';

function MfaSetup() {
  const { setupMfa, verifyMfaSetup, isLoading, error } = useAuthonMfa();
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
    if (success) alert('MFA enabled!');
  };

  return (
    <div>
      <button onClick={handleSetup} disabled={isLoading}>Enable MFA</button>
      {qrSvg && (
        <>
          <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p>Scan this QR code with your authenticator app</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
          <button onClick={handleVerify}>Verify</button>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

### MFA 로그인

```tsx
import { useAuthon } from '@authon/react';
import { useAuthonMfa } from '@authon/react';
import { AuthonMfaRequiredError } from '@authon/js';

function SignIn() {
  const { client } = useAuthon();
  const { verifyMfa } = useAuthonMfa();
  const [mfaToken, setMfaToken] = useState('');

  const handleSignIn = async (email: string, password: string) => {
    try {
      await client!.signInWithEmail(email, password);
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        setMfaToken(err.mfaToken);  // Show MFA input
      }
    }
  };

  const handleMfaVerify = async (code: string) => {
    await verifyMfa(mfaToken, code);
  };

  // ...
}
```

### `useAuthonMfa()` 레퍼런스

| 프로퍼티 / 메서드 | 타입 | 설명 |
|-----------------|------|------|
| `setupMfa()` | `Promise<MfaSetupResponse & { qrCodeSvg: string } \| null>` | MFA 설정을 시작합니다 |
| `verifyMfaSetup(code)` | `Promise<boolean>` | TOTP 코드를 검증하여 설정을 완료합니다 |
| `verifyMfa(mfaToken, code)` | `Promise<boolean>` | 로그인 시 TOTP 코드를 검증합니다 |
| `disableMfa(code)` | `Promise<boolean>` | MFA를 비활성화합니다 |
| `getMfaStatus()` | `Promise<MfaStatus \| null>` | MFA 상태를 조회합니다 |
| `regenerateBackupCodes(code)` | `Promise<string[] \| null>` | 백업 코드를 재생성합니다 |
| `isLoading` | `boolean` | 로딩 상태입니다 |
| `error` | `Error \| null` | 마지막으로 발생한 오류입니다 |

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
