[English](./README.md) | **한국어**

# @authon/react

> React 인증 훅 및 컴포넌트 -- 셀프 호스팅 Clerk 대안, Auth0 대안

## 설치

```bash
npm install @authon/react
```

## 빠른 시작

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthonProvider, useAuthon, useUser, SignedIn, SignedOut, UserButton } from '@authon/react';

function App() {
  const { openSignIn, signOut } = useAuthon();
  const { user } = useUser();

  return (
    <div>
      <SignedOut>
        <button onClick={() => openSignIn()}>로그인</button>
      </SignedOut>
      <SignedIn>
        <p>환영합니다, {user?.email}</p>
        <UserButton />
      </SignedIn>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthonProvider publishableKey="pk_live_...">
    <App />
  </AuthonProvider>
);
```

## 주요 작업

### Google OAuth 로그인

```tsx
const { client } = useAuthon();
<button onClick={() => client?.signInWithOAuth('google')}>Google로 로그인</button>
```

### 라우트 보호

```tsx
import { Protect } from '@authon/react';

<Protect fallback={<p>로그인이 필요합니다.</p>}>
  <Dashboard />
</Protect>
```

### 현재 사용자

```tsx
const { user, isLoading } = useUser();
```

### 로그아웃

```tsx
const { signOut } = useAuthon();
<button onClick={() => signOut()}>로그아웃</button>
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `AUTHON_PUBLISHABLE_KEY` | Yes | 프로젝트 퍼블리셔블 키 |

## 비교

| 기능 | Authon | Clerk | Auth.js |
|------|--------|-------|---------|
| 셀프 호스팅 | Yes | No | 부분적 |
| 가격 | 무료 | $25/월+ | 무료 |
| ShadowDOM 모달 | Yes | No | No |
| MFA/패스키 | Yes | Yes | 플러그인 |
| Web3 인증 | Yes | No | No |

## 라이선스

MIT
