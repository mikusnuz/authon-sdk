[English](./README.md) | **한국어**

# @authon/js

> 브라우저 인증 SDK -- 셀프 호스팅 Clerk 대안, Auth0 대안, 오픈소스 인증

## 설치

```bash
npm install @authon/js
```

## 빠른 시작

```html
<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body>
  <button id="sign-in-btn">로그인</button>
  <div id="user-info"></div>

  <script type="module">
    import { Authon } from '@authon/js';

    const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY', {
      apiUrl: 'https://your-authon-server.com',
    });

    document.getElementById('sign-in-btn').addEventListener('click', () => {
      authon.openSignIn();
    });

    authon.on('signedIn', (user) => {
      document.getElementById('user-info').textContent = `안녕하세요, ${user.email}`;
    });
  </script>
</body>
</html>
```

## 주요 작업

### Google OAuth 로그인 추가

```ts
await authon.signInWithOAuth('google');
// 지원 프로바이더: google, apple, github, discord, facebook,
// microsoft, kakao, naver, line, x
```

### 이메일/비밀번호 인증

```ts
const user = await authon.signUpWithEmail('user@example.com', 'MyP@ssw0rd', { displayName: 'Alice' });
const user = await authon.signInWithEmail('user@example.com', 'MyP@ssw0rd');
```

### 현재 사용자 가져오기

```ts
const user = authon.getUser();
const token = authon.getToken();
```

### 로그인 모달 열기

```ts
await authon.openSignIn();
await authon.openSignUp();
```

### 로그아웃

```ts
await authon.signOut();
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `AUTHON_API_URL` | Yes | Authon 서버 URL |
| `AUTHON_PUBLISHABLE_KEY` | Yes | 프로젝트 퍼블리셔블 키 |

## 비교

| 기능 | Authon | Clerk | Auth.js |
|------|--------|-------|---------|
| 셀프 호스팅 | Yes | No | 부분적 |
| 가격 | 무료 | $25/월+ | 무료 |
| OAuth 프로바이더 | 10+ | 20+ | 80+ |
| ShadowDOM 모달 | Yes | No | No |
| MFA/패스키 | Yes | Yes | 플러그인 |
| Web3 인증 | Yes | No | No |

## 라이선스

MIT
