[English](./README.md) | **한국어**

# @authon/shared

> Authon SDK 공유 타입 및 상수 -- 직접 사용하지 않고 프레임워크별 SDK를 설치하세요

## 설치

```bash
npm install @authon/shared
```

## 사용법

```ts
import type { AuthonUser, AuthTokens, AuthTokenRefreshResponse, OAuthProviderType } from '@authon/shared';
import { OAUTH_PROVIDERS, DEFAULT_BRANDING, AUDIT_EVENTS } from '@authon/shared';
```

## 주요 타입

| 타입 | 설명 |
|------|------|
| `AuthonUser` | 사용자 (id, email, displayName, avatarUrl 등) |
| `AuthTokens` | 토큰 쌍 (accessToken, refreshToken, expiresIn) |
| `AuthTokenRefreshResponse` | 회전 후 새 sessionId가 포함된 서버 갱신 응답 |
| `OAuthProviderType` | OAuth 프로바이더 |
| `PasskeyCredential` | 패스키 자격증명 |
| `Web3Wallet` | Web3 지갑 |
| `BrandingConfig` | 모달 브랜딩 설정 |

## 라이선스

MIT
