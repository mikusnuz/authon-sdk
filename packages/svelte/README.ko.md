[English](./README.md) | **한국어**

# @authon/svelte

[Authon](https://authon.dev)을 위한 Svelte SDK — store, 액션, 컴포넌트를 제공합니다.

## 설치

```bash
npm install @authon/svelte
# 또는
pnpm add @authon/svelte
```

`svelte >= 4.0.0`이 필요합니다.

## 빠른 시작

### 1. 초기화

```ts
// src/lib/authon.ts
import { initAuthon } from '@authon/svelte';

export const authon = initAuthon({
  publishableKey: 'pk_live_...',
});
```

### 2. Store 사용

```svelte
<script>
  import { user, isSignedIn, isLoading } from '@authon/svelte';
  import { openSignIn, signOut } from '@authon/svelte';
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else if $isSignedIn}
  <p>Welcome, {$user?.displayName}</p>
  <button on:click={signOut}>Sign Out</button>
{:else}
  <button on:click={openSignIn}>Sign In</button>
{/if}
```

### 3. 컴포넌트 사용

```svelte
<script>
  import { SignedIn, SignedOut, UserButton } from '@authon/svelte';
</script>

<SignedIn>
  <UserButton />
</SignedIn>
<SignedOut>
  <button on:click={openSignIn}>Sign In</button>
</SignedOut>
```

## API 레퍼런스

### Store

| Store | 타입 | 설명 |
|-------|------|------|
| `user` | `Readable<AuthonUser \| null>` | 현재 사용자 |
| `isSignedIn` | `Readable<boolean>` | 로그인 여부 |
| `isLoading` | `Readable<boolean>` | 인증 상태 로딩 여부 |

### 액션

| 함수 | 반환값 | 설명 |
|------|--------|------|
| `openSignIn()` | `Promise<void>` | 로그인 모달 열기 |
| `openSignUp()` | `Promise<void>` | 회원가입 모달 열기 |
| `signOut()` | `Promise<void>` | 로그아웃 |
| `getToken()` | `string \| null` | 현재 액세스 토큰 반환 |

### 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `<SignedIn>` | 로그인 상태일 때만 슬롯 렌더링 |
| `<SignedOut>` | 로그아웃 상태일 때만 슬롯 렌더링 |
| `<UserButton>` | 로그아웃 기능이 포함된 아바타 드롭다운 |

## 다중 인증 (MFA)

Authon 클라이언트 인스턴스를 통해 MFA에 접근합니다.

```svelte
<script>
  import { getAuthon } from '@authon/svelte';
  import { AuthonMfaRequiredError } from '@authon/js';

  const authon = getAuthon();
  let qrSvg = '';
  let mfaToken = '';

  async function enableMfa() {
    const setup = await authon.client.setupMfa();
    qrSvg = setup.qrCodeSvg;  // Display QR for authenticator app
  }

  async function verifySetup(code) {
    await authon.client.verifyMfaSetup(code);
  }

  async function signIn(email, password) {
    try {
      await authon.client.signInWithEmail(email, password);
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        mfaToken = err.mfaToken;  // Show TOTP input
      }
    }
  }

  async function verifyMfa(code) {
    await authon.client.verifyMfa(mfaToken, code);
  }
</script>

{#if qrSvg}
  {@html qrSvg}
  <p>Scan with your authenticator app</p>
{/if}
```

전체 API 레퍼런스는 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
