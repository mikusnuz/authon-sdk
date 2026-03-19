[English](./README.md) | **한국어**

# @authon/node

> Node.js 서버 SDK -- 토큰 검증, 사용자 관리, 웹훅 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/node
```

## 빠른 시작

```ts
import express from 'express';
import { AuthonBackend, expressMiddleware } from '@authon/node';

const app = express();
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

app.use('/api', expressMiddleware({ secretKey: process.env.AUTHON_SECRET_KEY! }));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

app.listen(3000);
```

## 주요 작업

### 토큰 검증

```ts
const user = await authon.verifyToken(accessToken);
```

### 사용자 관리

```ts
const result = await authon.users.list({ page: 1, limit: 20 });
const user = await authon.users.create({ email: 'user@example.com', password: 'pass' });
await authon.users.ban('usr_...', '스팸');
```

### 웹훅 검증

```ts
const event = authon.webhooks.verify(body, signature, timestamp, secret);
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `AUTHON_SECRET_KEY` | Yes | 서버 시크릿 키 |
| `AUTHON_API_URL` | No | API URL (기본값: `https://api.authon.dev`) |
| `AUTHON_WEBHOOK_SECRET` | 웹훅용 | 웹훅 서명 시크릿 |

## 라이선스

MIT
