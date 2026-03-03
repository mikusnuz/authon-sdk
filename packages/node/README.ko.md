[English](./README.md) | **한국어**

# @authon/node

[Authon](https://authon.dev)용 Node.js 서버 SDK — 토큰 검증, 사용자 관리, webhook 검증을 지원합니다.

## 설치

```bash
npm install @authon/node
# 또는
pnpm add @authon/node
```

## 빠른 시작

### 토큰 검증

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');

const user = await authon.verifyToken(accessToken);
console.log(user.id, user.email);
```

### Express Middleware

```ts
import express from 'express';
import { expressMiddleware } from '@authon/node';

const app = express();

app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  // req.auth는 검증된 AuthonUser입니다
  res.json({ user: req.auth });
});
```

### Fastify 플러그인

```ts
import Fastify from 'fastify';
import { fastifyPlugin } from '@authon/node';

const app = Fastify();

app.addHook('onRequest', fastifyPlugin({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (request, reply) => {
  reply.send({ user: request.auth });
});
```

### 사용자 관리

```ts
const authon = new AuthonBackend('sk_live_...');

// 사용자 목록 조회
const { data, total } = await authon.users.list({ page: 1, limit: 20 });

// 사용자 조회
const user = await authon.users.get('user_abc123');

// 사용자 생성
const newUser = await authon.users.create({
  email: 'new@example.com',
  password: 'securePassword',
  displayName: 'New User',
});

// 사용자 수정
await authon.users.update('user_abc123', {
  displayName: 'Updated Name',
  publicMetadata: { role: 'admin' },
});

// 정지 / 정지 해제
await authon.users.ban('user_abc123', 'Violation of ToS');
await authon.users.unban('user_abc123');

// 사용자 삭제
await authon.users.delete('user_abc123');
```

### Webhook 검증

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend('sk_live_...');

app.post('/webhooks/authon', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-authon-signature'] as string;
  try {
    const event = authon.webhooks.verify(req.body, signature, process.env.WEBHOOK_SECRET!);
    console.log('Event:', event);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(400);
  }
});
```

## API 레퍼런스

### `AuthonBackend`

| 메서드 | 반환값 | 설명 |
|--------|---------|-------------|
| `verifyToken(token)` | `Promise<AuthonUser>` | 액세스 토큰 검증 |
| `users.list(options?)` | `Promise<ListResult<AuthonUser>>` | 페이지네이션을 포함한 사용자 목록 조회 |
| `users.get(id)` | `Promise<AuthonUser>` | ID로 사용자 조회 |
| `users.create(data)` | `Promise<AuthonUser>` | 사용자 생성 |
| `users.update(id, data)` | `Promise<AuthonUser>` | 사용자 수정 |
| `users.delete(id)` | `Promise<void>` | 사용자 삭제 |
| `users.ban(id, reason?)` | `Promise<AuthonUser>` | 사용자 정지 |
| `users.unban(id)` | `Promise<AuthonUser>` | 사용자 정지 해제 |
| `webhooks.verify(payload, signature, secret)` | `Record<string, unknown>` | webhook HMAC-SHA256 서명 검증 |

### Middleware

| 내보내기 | 설명 |
|--------|-------------|
| `expressMiddleware(options)` | Express/Connect middleware, `req.auth` 설정 |
| `fastifyPlugin(options)` | Fastify onRequest 훅, `request.auth` 설정 |

## 다중 인증 (MFA)

MFA (TOTP) 설정 및 검증은 `@authon/js` 또는 프레임워크 SDK를 사용하여 클라이언트 측에서 처리됩니다. 서버 SDK는 MFA 검증 후 발급된 토큰을 자동으로 검증하므로 별도의 서버 측 설정이 필요하지 않습니다.

사용자에게 MFA가 활성화된 경우, 표준 토큰 검증 흐름은 동일하게 작동합니다.

```ts
const authon = new AuthonBackend('sk_live_...');

// MFA 검증 후 발급된 토큰은 일반 토큰과 동일하게 유효합니다
const user = await authon.verifyToken(accessToken);
// user.id, user.email — MFA가 완료된 검증된 사용자
```

클라이언트 측 설정 및 로그인 흐름은 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
