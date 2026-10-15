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

## 보안 및 검증

Provider는 미들웨어 호환성을 위해 기본 이름이 `authon-token`인 JavaScript 접근
가능 쿠키를 동기화합니다. 이 쿠키는 HttpOnly가 아니므로 XSS 방어가 필요합니다.
기본 미들웨어 검사는 JWT 구조와 `exp` 만 로컬에서 확인하며 JWT 서명을 검증하지
않습니다.
원격 토큰 검증은 `verifyToken: true`, API 라우트 보호는
`protectApiRoutes: true`로 각각 명시적으로 켭니다. 원격 검증 오류는 인증 실패로
처리됩니다. `@authon/nextjs/server`의 `currentUser()`와 `auth()`는 직접 응답과
`{ data: ... }` 래핑 응답을 모두 처리한 뒤 검증된 사용자만 반환합니다.

## 내장 지갑 토큰 (BFF 모드)

서버가 Authon 세션을 보유하는 경우(`sessionMode: 'bff'`) 브라우저에는 내장 지갑용 Authon 토큰이 없습니다. 서버에서 유효 시간 5분의 지갑 전용 토큰을 발급해 `@authon/js`의 `wallet.getToken`으로 반환하세요.

```ts
// app/api/wallet-token/route.ts
import { createAuthonWalletToken } from '@authon/nextjs/server';

export async function GET() {
  const userId = await getSignedInUserId(); // 자체 세션에서 가져옵니다
  const accessToken = await getAuthonAccessToken(); // 서버가 보관한 Authon 액세스 토큰
  const { token, expiresAt } = await createAuthonWalletToken({
    userId,
    accessToken, // 지갑 토큰을 이 세션에 묶습니다
    secretKey: process.env.AUTHON_SECRET_KEY!,
  });
  return Response.json({ token, expiresAt });
}
```

이 토큰은 지갑 API에서만 허용됩니다. `accessToken`을 함께 넘기면 지갑 토큰이 사용자 세션에 묶입니다. 세션이 해제되면 토큰도 더 이상 동작하지 않으며, 지갑 생성·복구·기기 해제는 세션에 묶인 토큰만 허용합니다. `accessToken` 없이 발급한 토큰은 상태 조회·서명·보호에만 쓸 수 있고, 사용자에게 유효한 세션이 하나 이상 남아 있을 때만 동작합니다.

## 라이선스

MIT
