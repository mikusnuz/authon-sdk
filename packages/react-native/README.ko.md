[English](./README.md) | **한국어**

# @authon/react-native

[Authon](https://authon.dev)용 React Native SDK입니다. 아래 기능을 제공합니다.

- 앱 전역 인증 상태를 위한 `AuthonProvider`
- `useAuthon()`, `useUser()` 훅
- storage adapter 기반 보안 토큰 저장
- `SocialButton`, `SocialButtons`
- 저수준 OAuth 헬퍼(`startOAuth`, `completeOAuth`, `client`)

## 설치

```bash
npm install @authon/react-native react-native-svg
npx expo install expo-secure-store expo-web-browser
```

Expo 앱에서는 `expo-secure-store`를 권장합니다.  
`expo-web-browser`는 필수는 아니지만, Android에서 더 안정적인 OAuth UX가 필요하면 함께 설치하는 편이 좋습니다.

## 설정

```tsx
import { AuthonProvider } from '@authon/react-native';
import * as SecureStore from 'expo-secure-store';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_..." storage={storage}>
      <Navigation />
    </AuthonProvider>
  );
}
```

storage adapter를 넣지 않으면 토큰은 메모리에만 남고 앱 재시작 시 사라집니다.

## 훅

### `useAuthon()`

```ts
const {
  isLoaded,
  isSignedIn,
  userId,
  accessToken,
  user,
  signIn,
  signUp,
  signOut,
  getToken,
  providers,
  branding,
  startOAuth,
  completeOAuth,
  on,
  client,
} = useAuthon();
```

### `useUser()`

```ts
const { isLoaded, isSignedIn, user } = useUser();
```

## 이메일 / 비밀번호 예제

```tsx
import { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useAuthon, useUser } from '@authon/react-native';

export function LoginScreen() {
  const { isLoaded } = useUser();
  const { signIn, signOut, user, isSignedIn } = useAuthon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn({ strategy: 'email_password', email, password });
    } catch (err: any) {
      setError(err.message ?? '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <ActivityIndicator />;

  if (isSignedIn) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Text>Welcome, {user?.displayName ?? user?.email}</Text>
        <Button title="로그아웃" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title={loading ? '로그인 중...' : '로그인'} onPress={handleSignIn} disabled={loading} />
    </View>
  );
}
```

## 소셜 버튼

```tsx
import { SocialButtons } from '@authon/react-native';

export function SocialLoginSection() {
  return (
    <SocialButtons
      onSuccess={() => console.log('Signed in')}
      onError={(error) => console.error(error)}
    />
  );
}
```

완전히 커스텀한 버튼이 필요하면 `SocialButton`을 직접 쓰거나 `startOAuth()` / `completeOAuth()`를 수동으로 호출하면 됩니다.

## 수동 OAuth 플로우

가장 단순한 SDK 플로우는 아래와 같습니다.

```tsx
import { Linking } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    const { url, state } = await startOAuth('google');
    await Linking.openURL(url);
    await completeOAuth(state);
  };

  // ...
}
```

이 방식은 가장 단순하지만, 브라우저 주도형이고 완료 감지는 polling 기반입니다.

## 권장 Expo OAuth 플로우

Android에서 더 자연스러운 브라우저 종료 UX가 필요하면 `flow=redirect`와 `returnTo`를 포함해 OAuth URL을 직접 요청하고 `expo-web-browser`로 여는 방식을 권장합니다.

```tsx
import * as WebBrowser from 'expo-web-browser';
import { Button } from 'react-native';
import { useAuthon } from '@authon/react-native';

const API_URL = 'https://api.authon.dev';
const PUBLISHABLE_KEY = 'pk_live_...';
const APP_DEEP_LINK = 'myapp://oauth-callback';
const RETURN_TO = 'https://auth.example.com/authon/mobile-callback';

async function requestOAuthUrl(provider: 'google') {
  const params = new URLSearchParams({
    redirectUri: `${API_URL}/v1/auth/oauth/redirect`,
    flow: 'redirect',
    returnTo: RETURN_TO,
  });

  const response = await fetch(
    `${API_URL}/v1/auth/oauth/${provider}/url?${params.toString()}`,
    { headers: { 'x-api-key': PUBLISHABLE_KEY } },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<{ url: string; state: string }>;
}

export function GoogleButton() {
  const { completeOAuth, getToken } = useAuthon();

  const handlePress = async () => {
    const { url, state } = await requestOAuthUrl('google');
    const pollPromise = completeOAuth(state);

    await WebBrowser.openAuthSessionAsync(url, APP_DEEP_LINK);
    await pollPromise;

    const authonAccessToken = getToken();
    // 앱이 자체 백엔드 세션도 가진다면 여기서 authonAccessToken을 교환하세요.
  };

  return <Button title="Google로 계속하기" onPress={handlePress} />;
}
```

HTTPS 브리지 페이지 예제:

```html
<!doctype html>
<html>
  <body>
    <script>
      const params = new URLSearchParams(window.location.search);
      const state = params.get('authon_oauth_state');
      const error = params.get('authon_oauth_error');

      const target = new URL('myapp://oauth-callback');
      if (state) target.searchParams.set('state', state);
      if (error) target.searchParams.set('error', error);

      window.location.replace(target.toString());
    </script>
  </body>
</html>
```

## 중요한 주의사항

- `myapp://...`를 OAuth 제공자 redirect URI로 직접 등록하지 마세요. 제공자 redirect URI는 항상 `{apiUrl}/v1/auth/oauth/redirect`여야 합니다.
- 앱 복귀용 브리지는 `returnTo`에 넣습니다. `returnTo`는 HTTPS URL이어야 하며, 해당 origin은 `ALLOWED_REDIRECT_ORIGINS`에 포함돼야 합니다.
- 커스텀 앱 스킴을 쓸 경우 HTTPS 브리지 페이지에서 `myapp://...`로 한 번 더 넘기세요.
- Android에서는 이미 열린 Custom Tab을 `dismissAuthSession()`으로 확실하게 닫을 수 없습니다. `openAuthSessionAsync()`와 브리지 체인을 기준으로 설계하세요.
- 앱이 자체 백엔드 세션도 운영한다면 `completeOAuth()` 직후 `getToken()`을 백엔드에 넘겨 자체 세션을 발급받으세요.

## 문서

- [Authon docs](https://authon.dev/docs)
- [Authon OAuth flow](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
