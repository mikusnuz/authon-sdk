[English](./README.md) | **한국어**

# @authon/svelte

> Svelte 인증 -- 반응형 스토어 -- 셀프 호스팅 Clerk 대안

## 설치

```bash
npm install @authon/svelte
```

## 빠른 시작

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { initAuthon } from '@authon/svelte';
  import { onDestroy } from 'svelte';
  const authon = initAuthon('pk_live_...');
  onDestroy(() => authon.destroy());
</script>
<slot />
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { user, isSignedIn, openSignIn, signOut } = getAuthon();
</script>

{#if $isSignedIn}
  <p>환영합니다, {$user?.displayName}</p>
  <button on:click={signOut}>로그아웃</button>
{:else}
  <button on:click={openSignIn}>로그인</button>
{/if}
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `PUBLIC_AUTHON_PUBLISHABLE_KEY` | Yes | 퍼블리셔블 키 |

## 라이선스

MIT
