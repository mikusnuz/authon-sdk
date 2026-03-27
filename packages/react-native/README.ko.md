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
const { startOAuth, completeOAuth } = useAuthon();
const { url, state } = await startOAuth('google');
await Linking.openURL(url);
await completeOAuth(state);
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
