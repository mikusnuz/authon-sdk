# Authon SDK

[Authon](https://authon.dev) 공식 SDK -- 모던 앱을 위한 인증 플랫폼

![Version](https://img.shields.io/npm/v/@authon/js?label=version)
![License](https://img.shields.io/badge/license-MIT-blue)

## 패키지

| 패키지 | 레지스트리 | 설명 |
|---------|----------|-------------|
| [`@authon/shared`](./packages/shared) | [npm](https://www.npmjs.com/package/@authon/shared) | 공유 타입 및 상수 |
| [`@authon/js`](./packages/js) | [npm](https://www.npmjs.com/package/@authon/js) | 코어 브라우저 SDK -- ShadowDOM 모달, OAuth, 세션 |
| [`@authon/react`](./packages/react) | [npm](https://www.npmjs.com/package/@authon/react) | React 훅 및 컴포넌트 |
| [`@authon/nextjs`](./packages/nextjs) | [npm](https://www.npmjs.com/package/@authon/nextjs) | Next.js 미들웨어 및 서버 헬퍼 |
| [`@authon/vue`](./packages/vue) | [npm](https://www.npmjs.com/package/@authon/vue) | Vue 3 플러그인, 컴포저블, 컴포넌트 |
| [`@authon/nuxt`](./packages/nuxt) | [npm](https://www.npmjs.com/package/@authon/nuxt) | Nuxt 3 모듈 |
| [`@authon/svelte`](./packages/svelte) | [npm](https://www.npmjs.com/package/@authon/svelte) | Svelte 스토어 및 컴포넌트 |
| [`@authon/angular`](./packages/angular) | [npm](https://www.npmjs.com/package/@authon/angular) | Angular 서비스 및 가드 |
| [`@authon/react-native`](./packages/react-native) | [npm](https://www.npmjs.com/package/@authon/react-native) | React Native 모바일 SDK |
| [`@authon/node`](./packages/node) | [npm](https://www.npmjs.com/package/@authon/node) | Node.js 서버 SDK |
| [`authon` (Python)](./python) | [PyPI](https://pypi.org/project/authon/) | Django, Flask, FastAPI |
| [`authon-go`](./go) | [Go modules](https://pkg.go.dev/github.com/mikusnuz/authon-sdk/go) | Go net/http 미들웨어 |
| [`authon` (Dart)](./dart) | [pub.dev](https://pub.dev/packages/authon) | Flutter SDK |
| [`Authon` (Swift)](./swift) | SPM | iOS/macOS SDK |
| [`authon-kotlin`](./kotlin) | Maven | Android SDK |

## 빠른 시작

### React

```bash
npm install @authon/react
```

```tsx
import { AuthonProvider, SignedIn, SignedOut, UserButton } from '@authon/react';
import { useUser } from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </AuthonProvider>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>환영합니다, {user?.displayName}</h1>;
}
```

### Next.js

```bash
npm install @authon/nextjs
```

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHON_KEY!,
  publicRoutes: ['/', '/about', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

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

```ts
// 서버 사이드 토큰 검증
import { currentUser } from '@authon/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

### Node.js

```bash
npm install @authon/node
```

```ts
import { AuthonBackend, expressMiddleware } from '@authon/node';

// 미들웨어 -- 라우트를 자동으로 보호
app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

// 직접 클라이언트 사용
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

const user = await authon.verifyToken(accessToken);
const users = await authon.users.list({ page: 1, limit: 10 });
const event = authon.webhooks.verify(payload, signature, webhookSecret);
```

### Python (FastAPI)

```bash
pip install authon
```

```python
from fastapi import FastAPI, Depends
from authon import AuthonBackend, require_auth, AuthonUser

authon = AuthonBackend(secret_key="sk_live_...")
app = FastAPI()

@app.get("/api/profile")
async def profile(user: AuthonUser = Depends(require_auth(authon))):
    return {"id": user.id, "email": user.email}
```

## 문서

전체 문서는 [authon.dev/docs](https://authon.dev/docs)에서 확인할 수 있습니다.

## 기여하기

기여를 환영합니다. 변경 사항에 대해 먼저 이슈를 열어 논의해 주세요.

```bash
# 클론 및 설치
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk
pnpm install

# 전체 패키지 빌드
pnpm build

# 개발 모드
pnpm dev
```

## 라이선스

[MIT](./LICENSE)
