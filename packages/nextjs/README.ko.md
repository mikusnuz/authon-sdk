[English](./README.md) | **한국어**

# @authon/nextjs

> Next.js 인증 -- 미들웨어, 서버 헬퍼, React 컴포넌트 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/nextjs
```

## 빠른 시작

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html><body>
      <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY!}>
        {children}
      </AuthonProvider>
    </body></html>
  );
}
```

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';
export default authonMiddleware({ publicRoutes: ['/', '/sign-in'], signInUrl: '/sign-in' });
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
```

## 주요 작업

### 서버 컴포넌트에서 사용자 가져오기

```tsx
import { currentUser } from '@authon/nextjs/server';
const user = await currentUser();
```

### API 라우트 보호

```ts
import { auth } from '@authon/nextjs/server';
const { userId, user } = await auth();
```

### 미들웨어로 라우트 보호

```ts
export default authonMiddleware({ publicRoutes: ['/', '/sign-in'] });
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
