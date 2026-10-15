[English](./README.md) | **한국어**

# @authon/react-native

> React Native 모바일 인증 -- 보안 토큰 저장 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/react-native react-native-svg
npx expo install expo-secure-store expo-web-browser
```

## 빠른 시작

```tsx
import { AuthonProvider, useAuthon } from '@authon/react-native';
import * as SecureStore from 'expo-secure-store';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_..." storage={storage}>
      <HomeScreen />
    </AuthonProvider>
  );
}
```

## 주요 작업

### 이메일 로그인

```tsx
const { signIn } = useAuthon();
await signIn({ strategy: 'email_password', email, password });
```

### OAuth 로그인

```tsx
import * as WebBrowser from 'expo-web-browser';
import { useAuthon } from '@authon/react-native';

// 1. 앱 스킴(예: "myapp://")을 대시보드의 프로젝트 허용 origin에 추가합니다.
// 2. 필요하면 <AuthonProvider oauthReturnTo="myapp://oauth-callback" ...>를 지정해
//    startOAuth()와 <SocialButtons />가 돌아갈 위치를 알게 합니다.
function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    const { url } = await startOAuth('google', { returnTo: 'myapp://oauth-callback' });
    const result = await WebBrowser.openAuthSessionAsync(url, 'myapp://oauth-callback');
    if (result.type === 'success') await completeOAuth(result.url);
  };

  return <Button title="Sign in with Google" onPress={handlePress} />;
}
```

0.9.1부터 OAuth는 PKCE를 사용합니다.
- `startOAuth`는 verifier를 클라이언트에 보관하고 해시만 전송합니다.
- Authon은 일회용 `authon_code`를 붙여 `returnTo`로 리디렉션합니다.
- `completeOAuth(callbackUrl)`은 그 코드를 verifier와 함께 교환합니다.
- `GET /v1/auth/oauth/poll`은 상태만 반환하므로 `completeOAuth(state)`만으로는 더 이상 토큰을 받을 수 없습니다. 이 경우 `handleOAuthCallback(url)`이 딥링크를 받을 때까지 대기합니다.
- `crypto.getRandomValues`가 필요합니다(Expo SDK 49 이상 또는 `react-native-get-random-values`).
- 사용자가 MFA를 켜 두었다면 `completeOAuth`·`handleOAuthCallback`은 `AuthonMfaRequiredError`로 거부되고 `mfaRequired` 이벤트가 발생합니다. 아직 세션은 없으며, `verifyMfa(error.mfaToken, code)`로 마무리합니다.

```tsx
import { AuthonMfaRequiredError, useAuthon } from '@authon/react-native';

const { completeOAuth, verifyMfa } = useAuthon();
try {
  await completeOAuth(result.url);
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    const code = await askUserForTotpCode();
    await verifyMfa(err.mfaToken, code);
  } else throw err;
}
```

### Google OAuth 추가 (Expo 권장)

```tsx
import * as WebBrowser from 'expo-web-browser';
import { useAuthon } from '@authon/react-native';

function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    // 허용된 origin의 https 브리지가 myapp://oauth-callback으로
    // 302 리디렉션하며 authon_code와 authon_oauth_state를 전달합니다.
    const { url } = await startOAuth('google', {
      returnTo: 'https://your-domain.com/mobile-callback',
    });
    const result = await WebBrowser.openAuthSessionAsync(url, 'myapp://oauth-callback');
    if (result.type === 'success') await completeOAuth(result.url);
  };

  return <Button title="Sign in with Google" onPress={handlePress} />;
}
```

### 로그아웃

```tsx
const { signOut } = useAuthon();
await signOut();
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `AUTHON_PUBLISHABLE_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
