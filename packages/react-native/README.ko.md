[English](./README.md) | **한국어**

# @authon/react-native

[Authon](https://authon.dev)용 React Native SDK — 네이티브 OAuth, 보안 토큰 저장소, React 훅을 제공합니다.

## 설치

```bash
npm install @authon/react-native
# or
pnpm add @authon/react-native
```

`react-native >= 0.72`, `expo-auth-session`, `expo-secure-store`(또는 bare RN 동등 패키지)가 필요합니다.

## 빠른 시작

### 1. Provider

```tsx
// App.tsx
import { AuthonProvider } from '@authon/react-native';

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <Navigation />
    </AuthonProvider>
  );
}
```

### 2. 훅 사용

```tsx
import { useAuthon, useUser } from '@authon/react-native';
import { View, Text, Button } from 'react-native';

function ProfileScreen() {
  const { isSignedIn, signOut } = useAuthon();
  const { user } = useUser();

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.displayName}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

function SignInScreen() {
  const { signInWithOAuth, signInWithEmail } = useAuthon();

  return (
    <View>
      <Button title="Sign in with Google" onPress={() => signInWithOAuth('google')} />
      <Button title="Sign in with Apple" onPress={() => signInWithOAuth('apple')} />
    </View>
  );
}
```

## API 레퍼런스

### `<AuthonProvider>`

```tsx
<AuthonProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authon.dev',
    scheme: 'myapp',  // OAuth 리다이렉트용 커스텀 URL 스킴
  }}
>
```

### 훅

#### `useAuthon()`

```ts
const {
  isSignedIn,       // boolean
  isLoading,        // boolean
  user,             // AuthonUser | null
  signInWithOAuth,  // (provider: string) => Promise<void>
  signInWithEmail,  // (email: string, password: string) => Promise<AuthonUser>
  signOut,          // () => Promise<void>
  getToken,         // () => Promise<string | null>
} = useAuthon();
```

#### `useUser()`

```ts
const { user, isLoading } = useUser();
```

### 토큰 저장소

토큰은 `expo-secure-store`(Expo) 또는 플랫폼 키체인(bare RN)을 사용하여 저장되며, 자격증명은 저장 시 암호화됩니다.

## 다단계 인증 (MFA)

`useAuthon()`에서 반환되는 `client`를 통해 MFA에 접근합니다.

```tsx
import { useAuthon } from '@authon/react-native';
import { AuthonMfaRequiredError } from '@authon/js';

function MfaSetupScreen() {
  const { client } = useAuthon();
  const [qrSvg, setQrSvg] = useState('');

  const enableMfa = async () => {
    const setup = await client!.setupMfa();
    setQrSvg(setup.qrCodeSvg);  // QR을 SVG로 렌더링
    // setup.backupCodes — 사용자에게 안전하게 보관하도록 표시
  };

  const verifySetup = async (code: string) => {
    await client!.verifyMfaSetup(code);
  };

  // MFA 로그인 플로우
  const signIn = async (email: string, password: string) => {
    try {
      await client!.signInWithEmail(email, password);
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        // TOTP 입력 화면으로 이동
        // 이후: await client!.verifyMfa(err.mfaToken, code);
      }
    }
  };

  // ...
}
```

전체 API 레퍼런스는 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
