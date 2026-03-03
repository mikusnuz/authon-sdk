[English](./README.md) | **한국어**

# @authon/nextjs

[Authon](https://authon.dev)용 Next.js SDK — App Router를 위한 middleware, 서버 헬퍼, React 컴포넌트를 제공합니다.

## 설치

```bash
npm install @authon/nextjs
# or
pnpm add @authon/nextjs
```

`next >= 14.0.0`이 필요합니다.

## 빠른 시작

### 1. Middleware

엣지에서 라우트를 보호합니다.

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHON_KEY!,
  publicRoutes: ['/', '/about', '/pricing', '/sign-in'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

### 2. Provider

레이아웃을 감쌉니다.

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

### 3. 클라이언트 컴포넌트

`@authon/react`의 모든 훅과 컴포넌트를 사용합니다.

```tsx
'use client';

import { useUser, SignedIn, SignedOut, UserButton } from '@authon/nextjs';

export function Header() {
  return (
    <nav>
      <SignedIn><UserButton /></SignedIn>
      <SignedOut><a href="/sign-in">Sign In</a></SignedOut>
    </nav>
  );
}
```

### 4. 서버 사이드

```ts
import { currentUser, auth } from '@authon/nextjs/server';

// 서버 컴포넌트 또는 Route Handler에서 사용
export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}

// 전체 인증 상태 가져오기
const { userId, sessionId, getToken } = await auth();
```

## API 레퍼런스

### 클라이언트 익스포트

`@authon/react`의 모든 컴포넌트와 훅을 재익스포트합니다.

`AuthonProvider`, `useAuthon`, `useUser`, `SignedIn`, `SignedOut`, `UserButton`, `SignIn`, `SignUp`, `Protect`

### 서버 익스포트 (`@authon/nextjs/server`)

| 함수 | 반환값 | 설명 |
|------|--------|------|
| `currentUser()` | `Promise<AuthonUser \| null>` | 쿠키에서 현재 사용자를 가져옵니다 |
| `auth()` | `Promise<AuthState>` | 전체 인증 상태(userId, sessionId, getToken)를 가져옵니다 |

### Middleware

| 함수 | 설명 |
|------|------|
| `authMiddleware(options)` | 미인증 사용자를 리다이렉트하는 엣지 middleware |

## Multi-Factor Authentication (MFA)

`useAuthonMfa` 훅을 사용합니다(`@authon/react`에서 재익스포트됨).

```tsx
'use client';

import { useAuthonMfa } from '@authon/nextjs';

function MfaSettings() {
  const { setupMfa, verifyMfaSetup, disableMfa, getMfaStatus, isLoading } = useAuthonMfa();

  const handleEnable = async () => {
    const result = await setupMfa();
    if (result) {
      // result.qrCodeSvg — QR 코드를 표시할 SVG 문자열
      // result.backupCodes — 일회용 복구 코드
    }
  };

  // ...
}
```

전체 예시와 API 레퍼런스는 [`@authon/react` MFA 문서](../react/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
