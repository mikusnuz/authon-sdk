# Authup SDK

[Authup](https://authup.dev) 공식 SDK -- 모던 앱을 위한 인증 플랫폼

![Version](https://img.shields.io/npm/v/@authup/js?label=version)
![License](https://img.shields.io/badge/license-MIT-blue)

## 패키지

| 패키지 | 레지스트리 | 설명 |
|---------|----------|-------------|
| [`@authup/shared`](./packages/shared) | [npm](https://www.npmjs.com/package/@authup/shared) | 공유 타입 및 상수 |
| [`@authup/js`](./packages/js) | [npm](https://www.npmjs.com/package/@authup/js) | 코어 브라우저 SDK -- ShadowDOM 모달, OAuth, 세션 |
| [`@authup/react`](./packages/react) | [npm](https://www.npmjs.com/package/@authup/react) | React 훅 및 컴포넌트 |
| [`@authup/nextjs`](./packages/nextjs) | [npm](https://www.npmjs.com/package/@authup/nextjs) | Next.js 미들웨어 및 서버 헬퍼 |
| [`@authup/vue`](./packages/vue) | [npm](https://www.npmjs.com/package/@authup/vue) | Vue 3 플러그인, 컴포저블, 컴포넌트 |
| [`@authup/nuxt`](./packages/nuxt) | [npm](https://www.npmjs.com/package/@authup/nuxt) | Nuxt 3 모듈 |
| [`@authup/svelte`](./packages/svelte) | [npm](https://www.npmjs.com/package/@authup/svelte) | Svelte 스토어 및 컴포넌트 |
| [`@authup/angular`](./packages/angular) | [npm](https://www.npmjs.com/package/@authup/angular) | Angular 서비스 및 가드 |
| [`@authup/react-native`](./packages/react-native) | [npm](https://www.npmjs.com/package/@authup/react-native) | React Native 모바일 SDK |
| [`@authup/node`](./packages/node) | [npm](https://www.npmjs.com/package/@authup/node) | Node.js 서버 SDK |
| [`authup` (Python)](./python) | [PyPI](https://pypi.org/project/authup/) | Django, Flask, FastAPI |
| [`authup-go`](./go) | [Go modules](https://pkg.go.dev/github.com/mikusnuz/authup-sdk/go) | Go net/http 미들웨어 |
| [`authup` (Dart)](./dart) | [pub.dev](https://pub.dev/packages/authup) | Flutter SDK |
| [`Authup` (Swift)](./swift) | SPM | iOS/macOS SDK |
| [`authup-kotlin`](./kotlin) | Maven | Android SDK |

## 빠른 시작

### React

```bash
npm install @authup/react
```

```tsx
import { AuthupProvider, SignedIn, SignedOut, UserButton } from '@authup/react';
import { useUser } from '@authup/react';

function App() {
  return (
    <AuthupProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </AuthupProvider>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>환영합니다, {user?.displayName}</h1>;
}
```

### Next.js

```bash
npm install @authup/nextjs
```

```ts
// middleware.ts
import { authMiddleware } from '@authup/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHUP_KEY!,
  publicRoutes: ['/', '/about', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

```tsx
// app/layout.tsx
import { AuthupProvider } from '@authup/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthupProvider publishableKey={process.env.NEXT_PUBLIC_AUTHUP_KEY!}>
          {children}
        </AuthupProvider>
      </body>
    </html>
  );
}
```

```ts
// 서버 사이드 토큰 검증
import { currentUser } from '@authup/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

### Node.js

```bash
npm install @authup/node
```

```ts
import { AuthupBackend, expressMiddleware } from '@authup/node';

// 미들웨어 -- 라우트를 자동으로 보호
app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHUP_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

// 직접 클라이언트 사용
const authup = new AuthupBackend(process.env.AUTHUP_SECRET_KEY!);

const user = await authup.verifyToken(accessToken);
const users = await authup.users.list({ page: 1, limit: 10 });
const event = authup.webhooks.verify(payload, signature, webhookSecret);
```

### Python (FastAPI)

```bash
pip install authup
```

```python
from fastapi import FastAPI, Depends
from authup import AuthupBackend, require_auth, AuthupUser

authup = AuthupBackend(secret_key="sk_live_...")
app = FastAPI()

@app.get("/api/profile")
async def profile(user: AuthupUser = Depends(require_auth(authup))):
    return {"id": user.id, "email": user.email}
```

## 문서

전체 문서는 [authup.dev/docs](https://authup.dev/docs)에서 확인할 수 있습니다.

## 기여하기

기여를 환영합니다. 변경 사항에 대해 먼저 이슈를 열어 논의해 주세요.

```bash
# 클론 및 설치
git clone https://github.com/mikusnuz/authup-sdk.git
cd authup-sdk
pnpm install

# 전체 패키지 빌드
pnpm build

# 개발 모드
pnpm dev
```

## 라이선스

[MIT](./LICENSE)
