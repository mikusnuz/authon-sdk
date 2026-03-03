[English](./README.md) | **한국어**

# @authon/shared

[Authon](https://authon.dev) SDK용 공유 타입 및 상수 패키지입니다.

## 설치

```bash
npm install @authon/shared
# or
pnpm add @authon/shared
```

## 사용법

```ts
import type {
  AuthonUser,
  AuthonSession,
  AuthTokens,
  BrandingConfig,
  WebhookEvent,
} from '@authon/shared';

import {
  OAUTH_PROVIDERS,
  PROVIDER_DISPLAY_NAMES,
  PROVIDER_COLORS,
  WEBHOOK_EVENTS,
  API_KEY_PREFIXES,
  DEFAULT_BRANDING,
  DEFAULT_SESSION_CONFIG,
} from '@authon/shared';
```

## API 참조

### 타입

| 타입 | 설명 |
|------|------|
| `AuthonUser` | 사용자 객체: id, email, displayName, avatarUrl 등 |
| `AuthonSession` | 활성 세션: userId, ipAddress, expiresAt |
| `AuthTokens` | 토큰 응답: accessToken, refreshToken, expiresIn, user |
| `BrandingConfig` | 시각적 커스터마이징: 색상, 로고, 테두리 반경, 로케일 |
| `SessionConfig` | TTL 설정, 최대 세션 수, 단일 세션 모드 |
| `WebhookEvent` | 웹훅 페이로드: id, type, projectId, timestamp, data |
| `OAuthProviderType` | 지원되는 OAuth 프로바이더의 유니온 타입 |
| `WebhookEventType` | 웹훅 이벤트 타입의 유니온 타입 |
| `MfaSetupResponse` | MFA 설정 결과: secret, qrCodeUri, backupCodes |
| `MfaStatus` | MFA 상태: enabled, backupCodesRemaining |
| `MfaVerifyResponse` | MFA 검증 결과: 토큰 및 사용자 정보 |

### 상수

| 상수 | 설명 |
|------|------|
| `OAUTH_PROVIDERS` | 지원되는 프로바이더 배열: google, apple, kakao, naver 등 |
| `PROVIDER_DISPLAY_NAMES` | 사람이 읽을 수 있는 프로바이더 이름 |
| `PROVIDER_COLORS` | 프로바이더별 브랜드 색상 (bg, text) |
| `WEBHOOK_EVENTS` | 모든 웹훅 이벤트 타입 |
| `API_KEY_PREFIXES` | 키 접두사: `pk_live_`, `pk_test_`, `sk_live_`, `sk_test_` |
| `DEFAULT_BRANDING` | 기본 브랜딩 설정 |
| `DEFAULT_SESSION_CONFIG` | 기본 세션 설정 (액세스 토큰 15분, 리프레시 토큰 7일) |

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
