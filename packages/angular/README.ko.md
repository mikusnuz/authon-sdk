[English](./README.md) | **한국어**

# @authon/angular

[Authon](https://authon.dev)용 Angular SDK — service, guard, interceptor를 제공합니다.

## 설치

```bash
npm install @authon/angular
# 또는
pnpm add @authon/angular
```

`@angular/core >= 16.0.0` 이상이 필요합니다.

## 빠른 시작

### 1. 모듈 임포트

```ts
// app.config.ts
import { provideAuthon } from '@authon/angular';

export const appConfig = {
  providers: [
    provideAuthon({
      publishableKey: 'pk_live_...',
    }),
  ],
};
```

### 2. Service 사용

```ts
import { Component } from '@angular/core';
import { AuthonService } from '@authon/angular';

@Component({
  selector: 'app-header',
  template: `
    @if (auth.isSignedIn()) {
      <button (click)="auth.signOut()">Sign Out</button>
      <p>{{ auth.user()?.displayName }}</p>
    } @else {
      <button (click)="auth.openSignIn()">Sign In</button>
    }
  `,
})
export class HeaderComponent {
  constructor(public auth: AuthonService) {}
}
```

### 3. Route Guard

```ts
// app.routes.ts
import { authGuard } from '@authon/angular';

export const routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
];
```

### 4. HTTP Interceptor

발신 요청에 액세스 토큰을 자동으로 첨부합니다:

```ts
// app.config.ts
import { provideAuthon, authInterceptor } from '@authon/angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideAuthon({ publishableKey: 'pk_live_...' }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

## API 레퍼런스

### `AuthonService`

| 프로퍼티 / 메서드 | 타입 | 설명 |
|-------------------|------|------|
| `user()` | `Signal<AuthonUser \| null>` | 현재 사용자 signal |
| `isSignedIn()` | `Signal<boolean>` | 로그인 여부 |
| `isLoading()` | `Signal<boolean>` | 로딩 상태 |
| `openSignIn()` | `Promise<void>` | 로그인 모달 열기 |
| `openSignUp()` | `Promise<void>` | 회원가입 모달 열기 |
| `signOut()` | `Promise<void>` | 로그아웃 |
| `getToken()` | `string \| null` | 현재 액세스 토큰 반환 |

### Guard

| 익스포트 | 설명 |
|--------|------|
| `authGuard` | 미인증 사용자를 리다이렉트하는 `CanActivateFn` |

### Interceptor

| 익스포트 | 설명 |
|--------|------|
| `authInterceptor` | 요청에 Bearer 토큰을 추가하는 `HttpInterceptorFn` |

## 다중 인증 (MFA)

`AuthonService` 클라이언트를 통해 MFA에 접근합니다:

```ts
import { Component } from '@angular/core';
import { AuthonService } from '@authon/angular';
import { AuthonMfaRequiredError } from '@authon/js';

@Component({
  selector: 'app-mfa-setup',
  template: `
    <button (click)="enableMfa()">Enable MFA</button>
    <div *ngIf="qrSvg" [innerHTML]="qrSvg"></div>
    <input [(ngModel)]="code" placeholder="6-digit code" />
    <button (click)="verifySetup()">Verify</button>
  `,
})
export class MfaSetupComponent {
  qrSvg = '';
  code = '';

  constructor(private auth: AuthonService) {}

  async enableMfa() {
    const setup = await this.auth.client.setupMfa();
    this.qrSvg = setup.qrCodeSvg;
    // setup.backupCodes — 복구 코드를 반드시 저장해두세요
  }

  async verifySetup() {
    await this.auth.client.verifyMfaSetup(this.code);
  }

  // MFA 로그인 흐름
  async signIn(email: string, password: string) {
    try {
      await this.auth.client.signInWithEmail(email, password);
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        const code = prompt('Enter your 2FA code');
        if (code) await this.auth.client.verifyMfa(err.mfaToken, code);
      }
    }
  }
}
```

전체 API 레퍼런스는 [`@authon/js` MFA 문서](../js/README.md#multi-factor-authentication-mfa)를 참고하세요.

## 문서

[authon.dev/docs](https://authon.dev/docs)

## 라이선스

[MIT](../../LICENSE)
