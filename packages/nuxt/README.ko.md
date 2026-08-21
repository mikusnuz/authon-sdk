[English](./README.md) | **한국어**

# @authon/nuxt

> 자동 임포트 컴포저블과 Vue 컴포넌트를 제공하는 Nuxt 3 인증 모듈

현재 Nuxt 릴리스의 지원 범위에 맞춰 Node.js `^20.19.0` 또는
`>=22.12.0`이 필요합니다.

## 설치 및 설정

```bash
npm install @authon/nuxt
```

```env
NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=pk_test_...
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@authon/nuxt'],
  runtimeConfig: {
    public: {
      authon: {
        publishableKey: process.env.NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY,
      },
    },
  },
})
```

모듈이 런타임 플러그인을 설치하고 `useAuthon`, `useUser`를 자동 임포트합니다.
명시적으로 임포트하려면 전용 엔트리 포인트를 사용하세요.

```ts
import { useAuthon, useUser } from '@authon/nuxt/composables'
import { AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/nuxt'
```

`createAuthonPlugin`은 호환성을 위해 남아 있지만 Nuxt 앱에서는 더 이상 권장하지
않습니다. 새 앱에서는 수동 `plugins/authon.client.ts` 대신
`modules: ['@authon/nuxt']`와 자동 임포트를 사용하세요. 공개 키는 public runtime
config에 두고, 별도의 서버 비밀 키가 필요하다면 private runtime config에 둡니다.

## 라이선스

MIT
