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

    const authon = new Authon('pk_live_YOUR_PUBLISHABLE_KEY');

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
const result = await authon.signInWithEmail('user@example.com', 'MyP@ssw0rd');
if ('needsVerification' in result) {
  const user = await authon.verifyEmail(result.email, '123456');
}
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

### 내장 지갑

로그인한 사용자에게 화면 없이 비수탁 EVM 지갑을 만들어 줍니다. 먼저 Authon 콘솔에서 프로젝트의 지갑을 켜야 합니다.

```ts
const authon = new Authon('pk_live_...', { wallet: { autoCreate: true } });

authon.wallet.onChange((wallet) => render(wallet));
authon.on('walletError', (err) => console.warn(err.code));

const wallet = await authon.wallet.ensure();          // { address, protected, needsRestore, devices }
const signature = await authon.wallet.signMessage('hello');

// protect()와 restore()는 지갑 프레임에서 작은 확인 카드를 한 번 보여준 뒤
// 시스템 패스키 창을 띄웁니다(브라우저는 지갑 프레임 안에서의 탭을 요구합니다). 카드의 문구/색상을 지정할 수 있습니다.
button.onclick = () => authon.wallet.protect({
  ui: { title: 'Secure your account', confirmLabel: 'Continue with Face ID', accentColor: '#16a34a' },
});
restoreButton.onclick = () => authon.wallet.restore(); // wallet.needsRestore가 true일 때

const provider = authon.wallet.provider(1);           // EIP-1193: eth_accounts, eth_requestAccounts,
                                                      // eth_chainId, personal_sign,
                                                      // eth_signTypedData_v4, eth_signTransaction
```

기본 카드 문구와 색상은 `new Authon(pk, { wallet: { ui: { ... } } })`로 한 번에 지정할 수 있습니다. BFF 모드(`sessionMode: 'bff'`)에서는 `wallet.getToken`을 전달합니다. 이 함수는 서버에서 `@authon/nextjs/server`의 `createAuthonWalletToken`으로 발급한 단기 지갑 토큰을 반환해야 합니다.

기본 `apiUrl`을 쓰면 `wallet.origin`은 `https://wallet.authon.dev`가 기본값이며, 사용자 지정 `apiUrl`을 쓸 때는 직접 지정해야 합니다. 그 외의 provider 메서드는 코드 `4200` 오류를 던집니다. 지갑 오류는 `code`가 있는 `AuthonWalletError`로 던져집니다(`NOT_FOUND`, `NEEDS_RESTORE`, `NOT_PROTECTED`, `PRF_UNSUPPORTED`, `ORIGIN_NOT_ALLOWED`, `USER_CANCELLED`, `TIMEOUT`, `NEEDS_POPUP`, `POPUP_BLOCKED`, `NOT_SIGNED_IN`, `NOT_CONFIGURED`).

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
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
