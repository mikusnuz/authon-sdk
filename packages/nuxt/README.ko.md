[English](./README.md) | **한국어**

# @authon/nuxt

[Authon](https://authon.dev)을 위한 Nuxt 3 module — composable, 컴포넌트, 서버 미들웨어 자동 임포트를 지원합니다.

## 설치

```bash
npm install @authon/nuxt
# or
pnpm add @authon/nuxt
```

`nuxt >= 3.0.0` 이상이 필요합니다.

## 빠른 시작

### 1. Module 추가

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@authon/nuxt'],
  authon: {
    publishableKey: process.env.NUXT_PUBLIC_AUTHON_KEY,
  },
});
```

### 2. 페이지에서 사용

모든 composable과 컴포넌트는 자동으로 임포트됩니다:

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <SignedIn>
      <UserButton />
      <p>Welcome, {{ user?.displayName }}</p>
    </SignedIn>
    <SignedOut>
      <button @click="openSignIn()">Sign In</button>
    </SignedOut>
  </div>
</template>

<script setup>
const { user, openSignIn } = useAuthon();
</script>
```

### 3. 서버 사이드

```ts
// server/api/profile.get.ts
export default defineEventHandler(async (event) => {
  const user = await requireAuthonUser(event);
  return { user };
});
```

## API 레퍼런스

### Module 옵션

```ts
// nuxt.config.ts
authon: {
  publishableKey: string;
  secretKey?: string;        // 서버 사이드 검증용
  apiUrl?: string;
  publicRoutes?: string[];   // 인증이 필요 없는 라우트
}
```

### 자동 임포트 Composable

| Composable | 설명 |
|------------|------|
| `useAuthon()` | 전체 인증 상태 및 액션 |
| `useUser()` | 현재 사용자 및 로딩 상태 |

### 자동 임포트 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `<SignedIn>` | 로그인 상태일 때만 슬롯을 렌더링 |
| `<SignedOut>` | 로그아웃 상태일 때만 슬롯을 렌더링 |
| `<UserButton>` | 로그아웃 기능이 포함된 아바타 드롭다운 |
| `<Protect>` | fallback 슬롯을 지원하는 조건부 렌더링 |

### 서버 유틸리티

| 함수 | 설명 |
|------|------|
| `requireAuthonUser(event)` | 현재 사용자를 가져와 검증합니다 (미인증 시 401 반환) |
| `getAuthonUser(event)` | 현재 사용자를 가져오거나 null을 반환합니다 |

## Multi-Factor Authentication (MFA)

`useAuthon()`의 `client`를 통해 MFA에 접근합니다:

```vue
<script setup>
import { AuthonMfaRequiredError } from '@authon/js';

const { client } = useAuthon();

// MFA 설정
async function enableMfa() {
  const setup = await client.value.setupMfa();
  // setup.qrCodeSvg — 인증 앱용 SVG QR 코드
  // setup.backupCodes — 복구 코드
}

// MFA를 사용한 로그인
async function signIn(email, password) {
  try {
    await client.value.signInWithEmail(email, password);
  } catch (err) {
    if (err instanceof AuthonMfaRequiredError) {
      // TOTP 코드 입력 후:
      await client.value.verifyMfa(err.mfaToken, code);
    }
  }
}
</script>
```

전체 API 레퍼런스는 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
