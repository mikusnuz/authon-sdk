[English](./README.md) | **한국어**

# @authon/vue

> Vue 3 인증 -- composable, 컴포넌트 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/vue
```

## 빠른 시작

```ts
// main.ts
import { createApp } from 'vue';
import { createAuthon } from '@authon/vue';
import App from './App.vue';

const app = createApp(App);
app.use(createAuthon({ publishableKey: 'pk_live_...' }));
app.mount('#app');
```

```vue
<script setup lang="ts">
import { useAuthon, AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue';
const { openSignIn, signOut } = useAuthon();
</script>

<template>
  <AuthonSignedOut><button @click="openSignIn()">로그인</button></AuthonSignedOut>
  <AuthonSignedIn><AuthonUserButton /><button @click="signOut()">로그아웃</button></AuthonSignedIn>
</template>
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_AUTHON_PUBLISHABLE_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
