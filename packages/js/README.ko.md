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

OAuth 결과가 페이지에 전달되는 방식입니다(0.9.1 이상).

- SDK는 로그인마다 PKCE verifier를 만들고, Authon에는 SHA-256 해시만 보냅니다.
- 프로바이더 로그인이 끝나면 Authon은 브라우저에 원시 토큰이 아닌 일회용 코드(60초, 1회 사용)를 전달합니다.
- 팝업: 코드는 로그인을 시작한 정확한 origin으로만 전송됩니다. 팝업이 opener를 잃은 경우(cross-origin isolation 또는 Safari) 팝업이 페이지로 돌아와 같은 origin의 저장소를 통해 대기 중인 탭에 코드를 전달합니다.
- 리디렉션: 코드는 `?authon_code=...&authon_oauth_state=...` 형태로 페이지에 돌아옵니다. SDK는 로드되자마자 두 파라미터를 제거합니다.
- SDK는 `POST /v1/auth/oauth/token`에서 코드와 verifier를 교환합니다. `GET /v1/auth/oauth/poll`은 `pending`, `completed`, `error` 상태만 알려줍니다.
- 페이지의 origin은 프로젝트의 **Allowed Origins**에 등록되어 있어야 합니다(또는 프로젝트 도메인이어야 합니다). 그 외의 origin에서는 Authon이 OAuth 시작을 거부합니다.

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

### 패스키(WebAuthn) 로그인 추가

```ts
// 패스키 등록 (로그인한 상태여야 합니다)
const credential = await authon.registerPasskey('My MacBook');

// 패스키로 로그인
const user = await authon.authenticateWithPasskey();
```

`authenticateWithPasskey`는 discoverable 패스키로 로그인합니다. `email` 인자는 계속 받지만 더 이상 자격 증명 목록을 좁히지 않으므로, API가 어떤 주소에 계정이나 패스키가 있는지 노출하지 않습니다.

### 비밀번호 없는 로그인

| 메서드 | 반환 |
|--------|------|
| `sendMagicLink(email, { redirectUrl? })` | `Promise<void>` |
| `sendEmailOtp(email)` | `Promise<void>` |
| `verifyPasswordless({ token?, email?, code? })` | `Promise<AuthonUser>` |
| `handleMagicLink()` | `Promise<AuthonUser \| null>` |
| `getPendingMagicLink()` | `{ email, reason } \| null` |
| `confirmMagicLink()` | `Promise<AuthonUser>` |
| `dismissMagicLink()` | `void` |

매직 링크는 프로젝트에 콜백 URL/도메인이 설정되어 있으면 그 주소의 `/auth/verify`를, 아니면 링크를 요청한 페이지를 엽니다. 이 SDK가 요청한 링크는 `/auth/verify`를 포함한 모든 대상에서 토큰을 URL 프래그먼트(`#authon_magic_link=1&token=...`)에 담으므로 서버·프록시·로그에 전달되지 않습니다. 브라우저에서 읽어야 합니다(SDK가 처리합니다). SDK의 브라우저 값이 없는 요청(이전 SDK, API 직접 호출)만 `?token=...&authon_magic_link=1` 형식을 받으며, SDK는 이 형식도 계속 읽습니다. `?token=`을 서버에서 읽는 자체 `/auth/verify` 라우트는 브라우저 처리로 바꿔야 합니다. `autoHandleMagicLink`(기본값 `true`)가 켜져 있으면 SDK가 즉시 URL에서 링크를 제거하고 페이지 로드 시 로그인을 마칩니다. 직접 제어하려면 `false`로 설정하고 `handleMagicLink()`를 직접 호출하세요. 콘솔(로그인 방식 > 비밀번호 없는 로그인)에서 프로젝트별로 "매직 링크"와 "6자리 코드" 중 하나를 선택하며, 선택하지 않은 방식은 API가 `AUTH_METHOD_DISABLED`로 거부합니다.

링크는 **요청한 브라우저에서만** (SDK가 `localStorage`에 임의의 값을 보관했다가 요청과 함께 보냅니다) **그리고 아직 아무도 로그인하지 않은 경우에만** 조용히 로그인됩니다. 그 외의 경우(다른 기기에서 연 링크, 이전 SDK가 요청한 링크, 다른 사람이 보내 준 링크 등)에는 로그인되지 않고 SDK가 `magicLinkConfirmationRequired` 이벤트를 발생시킵니다. 계속하기 전에 사용자에게 확인하세요.

```ts
authon.on('magicLinkConfirmationRequired', ({ email, reason }) => {
  // reason: 'unrecognized_browser' (다른 브라우저/기기) 또는 'signed_in' (현재 세션을 대체하게 됨)
  if (confirm(`Sign in as ${email}?`)) authon.confirmMagicLink();
  else authon.dismissMagicLink();
});
// 또는 `await authon.handleMagicLink()`가 null로 끝난 뒤:
const pending = authon.getPendingMagicLink();
```

이메일 코드는 같은 IP에서 요청한 가장 최근 코드(없으면 가장 최근 코드)와만 비교합니다. 새 코드나 링크를 보내면 이전 링크와 그 IP에서 요청한 코드가 취소됩니다. 코드당 시도는 5회이며 그중 다른 IP에서는 최대 3회만 쓸 수 있어, 다른 사람이 주인의 시도 횟수를 모두 써 버릴 수 없습니다. 연속으로 틀리면 짧은 대기가 붙습니다(HTTP 429 `PASSWORDLESS_RETRY_LATER`, `retryAfter`초, 최대 60초). 발송은 주소당 10분에 3회로 제한되며(HTTP 429 `PASSWORDLESS_SEND_LIMITED`), 한 주소에서 1시간 안에 10회 틀리면 새 코드는 5분 간격으로만 발급되고 시도는 3회(다른 IP 1회)로 줄어듭니다. 긴 잠금은 없습니다.

계정에 TOTP MFA가 켜져 있으면 매직 링크, 이메일 코드, Web3 로그인도 비밀번호 로그인과 똑같이 끝납니다. `mfaRequired` 이벤트가 발생하고 호출은 `AuthonMfaRequiredError`로 거부되며, `verifyMfa(error.mfaToken, code)`로 마칩니다. 인가 코드(BFF) 모드에서는 요청이 열린 채로 유지되고 `verifyMfa()`가 완료합니다. 패스키 로그인은 기기에서 사용자 확인을 이미 요구하므로 다시 묻지 않습니다.

콘솔에서 꺼 둔 로그인 방식(비밀번호 없는 로그인, 패스키, Web3)은 모달에서 숨겨질 뿐 아니라 API도 `AUTH_METHOD_DISABLED`로 거부합니다.

### 내장 지갑

로그인한 사용자에게 화면 없이 비수탁 EVM 지갑을 만들어 줍니다. 먼저 Authon 콘솔에서 프로젝트의 지갑을 켜야 합니다(고급 > 내장 지갑).

각 지갑은 HD 지갑입니다. BIP39 시드를 세 조각(이 기기, Authon, 패스키 백업)으로 나누며, 두 조각만 있으면 서명할 수 있고 Authon 단독으로는 서명할 수 없습니다. EVM 계정은 `m/44'/60'/0'/0/0` 경로로 파생됩니다. 시드는 `wallet.authon.dev`의 지갑 프레임 밖으로 나가지 않습니다.

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
restoreButton.onclick = () => authon.wallet.restore(); // wallet.needsRestore가 true일 때, 다른 기기는 계속 동작합니다
lostDeviceButton.onclick = () => authon.wallet.restore({ resetOtherDevices: true }); // 기기를 분실했을 때

const provider = authon.wallet.provider(1);           // EIP-1193: eth_accounts, eth_requestAccounts,
                                                      // eth_chainId, personal_sign,
                                                      // eth_signTypedData_v4, eth_signTransaction
```

기본 카드 문구와 색상은 `new Authon(pk, { wallet: { ui: { ... } } })`로 한 번에 지정할 수 있습니다. BFF 모드(`sessionMode: 'bff'`)에서는 `wallet.getToken`을 전달합니다. 이 함수는 서버에서 `@authon/nextjs/server`의 `createAuthonWalletToken`으로 발급한 단기 지갑 토큰을 반환해야 합니다.

**`wallet.protected`가 true가 되기 전에는 사용자가 자산을 받지 않게 하세요**(`await authon.wallet.isProtected()`). `protect()`로 패스키 백업을 만들기 전까지 지갑은 이 브라우저의 조각과 Authon 조각으로만 존재하므로, 사이트 데이터 삭제, Safari의 저장소 정리, 기기 분실이 일어나면 복구할 수 없습니다.

`signMessage`, `signTypedData`, `signTransaction`은 모두 사용자의 승인이 필요하며, 승인한 뒤에야 완료됩니다. 위험도가 낮은 요청(개인 메시지, 아무 권한도 부여하지 않는 타입 데이터)은 지갑 프레임 안에 요청한 사이트와 전체 텍스트가 담긴 카드를 보여줍니다. 텍스트를 끝까지 스크롤해야 서명 버튼이 활성화되며, 16,384자를 넘는 텍스트는 `MESSAGE_TOO_LARGE`로 거부됩니다. 위험도가 높은 요청(금액 또는 호출 데이터가 있는 거래, 토큰 승인, permit, Permit2, 주문, 메타 트랜잭션)은 작은 카드를 보여주고, 카드의 버튼을 누르면 Authon 창(`https://wallet.authon.dev/confirm`)이 열립니다. 사용자는 페이지 바깥인 이 창에서 내용을 확인하고 승인합니다. 클릭은 지갑 프레임 안에서 일어나므로 이 메서드들을 클릭 핸들러에서 호출하지 않아도 됩니다. 사용자가 거절하면 `USER_CANCELLED`, 창이 차단되거나 닫히면 `CONFIRM_WINDOW_BLOCKED` / `CONFIRM_WINDOW_CLOSED`가 던져지며, 어느 경우에도 서명하지 않습니다. 승인 절차는 콘솔의 프로젝트 지갑 설정에서만 끌 수 있고 페이지에서는 끌 수 없습니다. 지갑 프레임은 `create:`, `device:`, `restore:`로 시작하는 메시지와 "Authon Wallet Proof" 도메인의 타입 데이터에는 서명하지 않습니다(지갑 키 증명 전용).

`revokeDevice()`는 기기 조각이 있는 브라우저에서만 호출할 수 있고(요청을 그 조각의 기기 키로 서명합니다), 보호하지 않은 지갑의 마지막 기기는 해제할 수 없습니다(`LAST_DEVICE`). BFF 모드에서는 `createAuthonWalletToken({ accessToken })`에 사용자의 Authon 액세스 토큰을 넘기세요. 지갑 생성·복구·기기 해제에는 세션에 묶인 토큰이 필요합니다(없으면 `SESSION_REQUIRED`). 운영 지갑 프레임은 `https://` 페이지에서만, 그리고 페이지 자신만 임베드할 수 있습니다. 페이지가 다른 사이트의 iframe 안에 있으면 지갑 프레임이 로드되지 않습니다.

`wallet.backupUpgradeRecommended`가 true이면 패스키 백업이 서버 검증 복구가 도입되기 전에 만들어진 것입니다. `await authon.wallet.upgradeBackup()`을 호출하는 버튼을 제공하세요(클릭 시점에, `needsRestore`가 false인 브라우저에서 호출). 새 패스키 백업이 만들어지며, 다른 기기와 사이트에서는 새 패스키로 한 번씩 복구해야 합니다.

기본 `apiUrl`을 쓰면 `wallet.origin`은 `https://wallet.authon.dev`가 기본값이며, 사용자 지정 `apiUrl`을 쓸 때는 직접 지정해야 합니다. 그 외의 provider 메서드는 코드 `4200` 오류를 던집니다. 지갑 오류는 `code`가 있는 `AuthonWalletError`로 던져집니다(`NOT_FOUND`, `NEEDS_RESTORE`, `NOT_PROTECTED`, `PRF_UNSUPPORTED`, `ORIGIN_NOT_ALLOWED`, `USER_CANCELLED`, `TIMEOUT`, `NEEDS_POPUP`, `POPUP_BLOCKED`, `NOT_SIGNED_IN`, `NOT_CONFIGURED`, `LAST_DEVICE`, `SESSION_REQUIRED`, `STORAGE_UNAVAILABLE`, `CONFIRM_WINDOW_BLOCKED`, `CONFIRM_WINDOW_CLOSED`, `MESSAGE_TOO_LARGE`, `FRAME_OUTDATED`, `BACKUP_KEY_REQUIRED`, `ALREADY_UPGRADED`).

## 보안

### 토큰 저장

기본 브라우저 모드(`sessionMode: 'browser'`)에서 SDK는 페이지를 새로고침해도 세션이 유지되도록 액세스 토큰과 리프레시 토큰을 `localStorage`에 보관합니다. 같은 origin에서 실행되는 모든 스크립트가 `localStorage`를 읽을 수 있으므로, 앱의 XSS 취약점이나 침해된 서드파티 스크립트가 토큰을 훔쳐 만료될 때까지 사용할 수 있습니다.

리프레시 토큰은 1회용입니다. 갱신하면 토큰이 교체되고, 이전 토큰은 이후 거부됩니다.

**프로젝트에서 내장 지갑이나 그 밖의 고가치 작업을 쓴다면 BFF 모드를 사용하세요.** `sessionMode: 'bff'`에서는 SDK가 브라우저 토큰 저장소를 읽거나 쓰지 않습니다. Authon 토큰은 서버가 HttpOnly 세션에 보관하고, 지갑은 `wallet.getToken`을 통해 지갑 전용 단기 토큰을 받습니다(`@authon/nextjs/server`의 `createAuthonWalletToken`으로 발급). [Authorization Code + PKCE를 사용한 BFF 인증](https://github.com/mikusnuz/authon-sdk/blob/main/docs/bff-authorization-code-pkce.md)을 참고하세요.

브라우저 모드를 유지한다면 엄격한 Content Security Policy를 적용하고, 서드파티 스크립트를 최소화하며, 액세스 토큰 TTL을 짧게 유지하세요.

### 브랜딩 및 프로필 렌더링

로그인 모달과 프로필 UI는 프로젝트 브랜딩 값과 사용자 필드를 렌더링하기 전에 모두 이스케이프합니다. 이용약관과 개인정보처리방침 링크는 절대 `http(s)` URL이어야 합니다. 로고는 base64 `data:image/(png|jpeg|gif|webp|svg+xml)` URL이어야 하며 `<img>`로만 렌더링됩니다. 색상은 hex, `rgb[a]()`, `hsl[a]()` 형식이어야 합니다. 사용자 지정 CSS는 별도의 `<style>` 요소에 텍스트로 넣으며 `</style` 시퀀스는 제거됩니다. 유효하지 않은 값은 버려지고 기본값이 사용됩니다.

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
