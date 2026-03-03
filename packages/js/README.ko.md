[English](./README.md) | **한국어**

# @authon/js

[Authon](https://authon.dev)의 핵심 브라우저 SDK — ShadowDOM 로그인 모달, OAuth 플로우, 세션 관리를 제공합니다.

## 설치

```bash
npm install @authon/js
# or
pnpm add @authon/js
```

## 빠른 시작

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_...');

// 로그인 모달 열기
await authon.openSignIn();

// 인증 이벤트 구독
authon.on('signedIn', (user) => {
  console.log('Signed in:', user.email);
});

authon.on('signedOut', () => {
  console.log('Signed out');
});

// 이메일/비밀번호 로그인
const user = await authon.signInWithEmail('user@example.com', 'password');

// OAuth 로그인 (대시보드 기본 플로우 사용: auto | popup | redirect)
await authon.signInWithOAuth('google');

// 런타임에서 플로우 방식 직접 지정 (선택 사항)
await authon.signInWithOAuth('google', { flowMode: 'redirect' });

// 현재 사용자 및 토큰 조회
const currentUser = authon.getUser();
const token = authon.getToken();

// 로그아웃
await authon.signOut();
```

## 설정

```ts
const authon = new Authon('pk_live_...', {
  apiUrl: 'https://api.authon.dev',  // 커스텀 API URL
  mode: 'popup',                      // 'popup' | 'embedded'
  theme: 'auto',                      // 'light' | 'dark' | 'auto'
  locale: 'en',                       // 모달 UI 언어
  containerId: 'auth-container',      // 컨테이너 요소 ID (embedded 모드)
  appearance: {                        // 커스텀 브랜딩 덮어쓰기
    primaryColorStart: '#7c3aed',
    primaryColorEnd: '#4f46e5',
    borderRadius: 12,
    brandName: 'My App',
  },
});
```

## API 레퍼런스

### `Authon` 클래스

| 메서드 | 반환값 | 설명 |
|--------|---------|-------------|
| `openSignIn()` | `Promise<void>` | 로그인 모달 열기 |
| `openSignUp()` | `Promise<void>` | 회원가입 모달 열기 |
| `signInWithEmail(email, password)` | `Promise<AuthonUser>` | 이메일/비밀번호로 로그인 |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthonUser>` | 이메일/비밀번호로 회원가입 |
| `signInWithOAuth(provider, options?)` | `Promise<void>` | OAuth 플로우 시작 (`auto`, `popup`, `redirect`) |
| `signOut()` | `Promise<void>` | 로그아웃 및 세션 초기화 |
| `getUser()` | `AuthonUser \| null` | 현재 사용자 조회 |
| `getToken()` | `string \| null` | 현재 액세스 토큰 조회 |
| `on(event, listener)` | `() => void` | 이벤트 구독 (구독 해제 함수 반환) |
| `destroy()` | `void` | 리소스 정리 |

### 이벤트

| 이벤트 | 페이로드 | 설명 |
|-------|---------|-------------|
| `signedIn` | `AuthonUser` | 사용자 로그인 완료 |
| `signedOut` | 없음 | 사용자 로그아웃 완료 |
| `tokenRefreshed` | `string` | 액세스 토큰 갱신됨 |
| `error` | `Error` | 오류 발생 |
| `mfaRequired` | `string` | MFA 인증 필요 (페이로드는 mfaToken) |

## 다단계 인증 (MFA)

Authon은 Google Authenticator, Authy 등 다양한 인증 앱과 호환되는 TOTP 기반 MFA를 지원합니다.

### MFA 설정

```ts
import { Authon, generateQrSvg } from '@authon/js';

const authon = new Authon('pk_live_...');

// 1. MFA 설정 시작 (로그인 상태여야 함)
const setup = await authon.setupMfa();
// setup.secret       — TOTP 시크릿 키
// setup.qrCodeUri    — 인증 앱용 otpauth:// URI
// setup.backupCodes  — 일회용 복구 코드
// setup.qrCodeSvg    — QR 코드 SVG 문자열 (바로 사용 가능)

// UI에 QR 코드 표시
document.getElementById('qr')!.innerHTML = setup.qrCodeSvg;

// 2. 사용자가 QR 코드를 스캔하고 6자리 코드를 입력
const verified = await authon.verifyMfaSetup('123456');
```

### MFA 로그인 플로우

MFA가 활성화되어 있으면 `signInWithEmail` 호출 시 `AuthonMfaRequiredError`가 발생합니다.

```ts
import { Authon, AuthonMfaRequiredError } from '@authon/js';

try {
  await authon.signInWithEmail('user@example.com', 'password');
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    // 사용자에게 TOTP 코드를 입력받아 인증
    const user = await authon.verifyMfa(err.mfaToken, '123456');
  }
}

// 이벤트 리스너 방식으로도 처리 가능
authon.on('mfaRequired', async (mfaToken) => {
  const code = prompt('Enter your 2FA code');
  if (code) await authon.verifyMfa(mfaToken, code);
});
```

### MFA 관리

```ts
// MFA 상태 조회
const status = await authon.getMfaStatus();
// status.enabled, status.backupCodesRemaining

// MFA 비활성화 (현재 TOTP 코드 필요)
await authon.disableMfa('123456');

// 복구 코드 재생성 (현재 TOTP 코드 필요)
const newCodes = await authon.regenerateBackupCodes('123456');
```

### QR 코드 생성기

SDK에는 외부 의존성 없이 QR 코드 SVG를 생성하는 기능이 내장되어 있습니다.

```ts
import { generateQrSvg } from '@authon/js';

const svg = generateQrSvg('otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp');
document.getElementById('qr')!.innerHTML = svg;
```

### MFA API 레퍼런스

| 메서드 | 반환값 | 설명 |
|--------|---------|-------------|
| `setupMfa()` | `Promise<MfaSetupResponse & { qrCodeSvg: string }>` | MFA 설정 시작, 시크릿 및 QR 코드 반환 |
| `verifyMfaSetup(code)` | `Promise<void>` | TOTP 코드 검증으로 설정 완료 |
| `verifyMfa(mfaToken, code)` | `Promise<AuthonUser>` | 로그인 중 TOTP 코드 검증 |
| `disableMfa(code)` | `Promise<void>` | MFA 비활성화 |
| `getMfaStatus()` | `Promise<MfaStatus>` | 현재 MFA 상태 조회 |
| `regenerateBackupCodes(code)` | `Promise<string[]>` | 복구 코드 재생성 |

## ShadowDOM 모달

로그인 모달은 ShadowRoot 내부에 렌더링되어 애플리케이션의 CSS와 충돌하지 않습니다. 브랜딩(색상, 로고, 테두리 반경, 커스텀 CSS)은 Authon 프로젝트 설정에서 불러오며 `appearance` 설정으로 덮어쓸 수 있습니다.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
