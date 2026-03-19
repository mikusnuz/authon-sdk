[English](./README.md) | **한국어**

# @authon/nuxt

> Nuxt 3 인증 -- 플러그인, composable, 라우트 미들웨어 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/nuxt
```

## 빠른 시작

```ts
// plugins/authon.client.ts
import { createAuthonPlugin } from '@authon/nuxt';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authon = createAuthonPlugin(config.public.authonKey, { apiUrl: config.public.authonApiUrl });
  return { provide: { authon } };
});
```

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp();
</script>

<template>
  <div v-if="$authon.isSignedIn">
    <p>환영합니다, {{ $authon.user?.displayName }}</p>
    <button @click="$authon.client.signOut()">로그아웃</button>
  </div>
  <button v-else @click="$authon.client.openSignIn()">로그인</button>
</template>
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NUXT_PUBLIC_AUTHON_API_URL` | Yes | Authon 서버 URL |
| `NUXT_PUBLIC_AUTHON_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
