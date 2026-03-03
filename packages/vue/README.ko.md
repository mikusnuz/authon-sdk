[English](./README.md) | **한국어**

# @authon/vue

[Authon](https://authon.dev)용 Vue 3 SDK — 플러그인, composable, 컴포넌트를 제공합니다.

## 설치

```bash
npm install @authon/vue
# 또는
pnpm add @authon/vue
```

`vue >= 3.3.0`이 필요합니다.

## 빠른 시작

### 1. 플러그인 설치

```ts
// main.ts
import { createApp } from 'vue';
import { AuthonPlugin } from '@authon/vue';
import App from './App.vue';

const app = createApp(App);
app.use(AuthonPlugin, {
  publishableKey: 'pk_live_...',
});
app.mount('#app');
```

### 2. Composable 사용

```vue
<script setup lang="ts">
import { useAuthon, useUser } from '@authon/vue';

const { isSignedIn, openSignIn, signOut } = useAuthon();
const { user, isLoading } = useUser();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isSignedIn">
    <p>Welcome, {{ user?.displayName }}</p>
    <button @click="signOut()">Sign Out</button>
  </div>
  <div v-else>
    <button @click="openSignIn()">Sign In</button>
  </div>
</template>
```

### 3. 컴포넌트 사용

```vue
<template>
  <SignedIn>
    <UserButton />
  </SignedIn>
  <SignedOut>
    <button @click="openSignIn()">Sign In</button>
  </SignedOut>
</template>

<script setup lang="ts">
import { SignedIn, SignedOut, UserButton, useAuthon } from '@authon/vue';

const { openSignIn } = useAuthon();
</script>
```

## API 레퍼런스

### 플러그인

```ts
app.use(AuthonPlugin, {
  publishableKey: string;
  apiUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
});
```

### Composable

#### `useAuthon()`

```ts
const {
  isSignedIn,  // Ref<boolean>
  isLoading,   // Ref<boolean>
  user,        // Ref<AuthonUser | null>
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
  client,      // Authon 인스턴스
} = useAuthon();
```

#### `useUser()`

```ts
const { user, isLoading } = useUser();
```

### 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `<SignedIn>` | 로그인 상태일 때만 슬롯을 렌더링 |
| `<SignedOut>` | 로그아웃 상태일 때만 슬롯을 렌더링 |
| `<UserButton>` | 로그아웃 기능이 포함된 아바타 드롭다운 |
| `<Protect>` | fallback 슬롯을 지원하는 조건부 렌더링 |

## Multi-Factor Authentication (MFA)

`useAuthon()`의 `client` 인스턴스를 통해 MFA 메서드에 접근합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthon } from '@authon/vue';
import { AuthonMfaRequiredError } from '@authon/js';

const { client } = useAuthon();
const qrSvg = ref('');
const mfaToken = ref('');

// MFA 설정
async function enableMfa() {
  const setup = await client.value!.setupMfa();
  qrSvg.value = setup.qrCodeSvg;  // 인증 앱에 표시할 QR 코드
}

async function verifySetup(code: string) {
  await client.value!.verifyMfaSetup(code);
}

// MFA를 사용한 로그인
async function signIn(email: string, password: string) {
  try {
    await client.value!.signInWithEmail(email, password);
  } catch (err) {
    if (err instanceof AuthonMfaRequiredError) {
      mfaToken.value = err.mfaToken;  // TOTP 입력 화면 표시
    }
  }
}

async function verifyMfa(code: string) {
  await client.value!.verifyMfa(mfaToken.value, code);
}
</script>
```

전체 API 레퍼런스는 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
