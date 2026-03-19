[English](./README.md) | **한국어**

# @authon/angular

> Angular 인증 -- 서비스, 가드, 소셜 버튼 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/angular
```

## 빠른 시작

```ts
// app.config.ts
import { provideAuthon } from '@authon/angular';

export const appConfig = {
  providers: [
    ...provideAuthon({ publishableKey: 'pk_live_...', config: { apiUrl: 'https://your-authon-server.com' } }),
  ],
};
```

```ts
// component
@Inject('AuthonService') public authon: AuthonService

// 로그인
await this.authon.openSignIn();

// 로그아웃
await this.authon.signOut();

// 사용자
const user = this.authon.user;
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `AUTHON_API_URL` | Yes | Authon 서버 URL |
| `AUTHON_PUBLISHABLE_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
