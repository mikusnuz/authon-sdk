**English** | [한국어](./README.ko.md)

# @authon/angular

> Drop-in Angular authentication with service, guard, and social buttons — self-hosted Clerk alternative, Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/angular?color=6d28d9)](https://www.npmjs.com/package/@authon/angular)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Install

```bash
npm install @authon/angular
```

## Quick Start

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuthon } from '@authon/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ...provideAuthon({
      publishableKey: 'pk_live_YOUR_PUBLISHABLE_KEY',
      config: { apiUrl: 'https://your-authon-server.com' },
    }),
  ],
};
```

```ts
// app.component.ts
import { Component, Inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { AuthonService } from '@authon/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div *ngIf="!authon.isLoading">
      <div *ngIf="authon.isSignedIn">
        <p>Welcome, {{ authon.user?.displayName }}</p>
        <button (click)="authon.signOut()">Sign out</button>
      </div>
      <button *ngIf="!authon.isSignedIn" (click)="authon.openSignIn()">Sign in</button>
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsub?: () => void;
  constructor(
    @Inject('AuthonService') public authon: AuthonService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() { this.unsub = this.authon.onStateChange(() => this.cdr.markForCheck()); }
  ngOnDestroy() { this.unsub?.(); }
}
```

## Common Tasks

### Add Google OAuth Login

```ts
async signInWithGoogle() {
  await this.authon.getClient().signInWithOAuth('google');
}
```

### Protect a Route

```ts
// app.routes.ts
import { inject } from '@angular/core';
import { authGuard, AuthonService } from '@authon/angular';

export const routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => {
      const authon = inject('AuthonService') as AuthonService;
      return authGuard(authon, '/sign-in');
    }],
  },
];
```

### Get Current User

```ts
const user = this.authon.user;
// { id, email, displayName, avatarUrl, emailVerified, ... }

const token = this.authon.getToken();
```

### Add Email/Password Auth

```ts
async handleSignIn(email: string, password: string) {
  await this.authon.getClient().signInWithEmail(email, password);
}
```

### Handle Sign Out

```ts
await this.authon.signOut();
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_API_URL` | Yes | Your Authon server URL |
| `AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key |

## API Reference

### AuthonService

| Property / Method | Type |
|-------------------|------|
| `user` | `AuthonUser \| null` |
| `isSignedIn` | `boolean` |
| `isLoading` | `boolean` |
| `openSignIn()` | `Promise<void>` |
| `openSignUp()` | `Promise<void>` |
| `signOut()` | `Promise<void>` |
| `getToken()` | `string \| null` |
| `getClient()` | `Authon` (full @authon/js client) |
| `onStateChange(cb)` | `() => void` (unsubscribe) |
| `web3GetNonce(...)` | Web3 nonce |
| `web3Verify(...)` | Web3 sign-in |
| `passwordlessSendCode(...)` | Magic link / OTP |
| `passkeyRegister(...)` | Register passkey |
| `passkeyAuthenticate(...)` | Auth with passkey |

### Helpers

| Function | Description |
|----------|-------------|
| `provideAuthon(config)` | Angular provider factory for standalone apps |
| `authGuard(service, redirectTo?)` | Route guard factory |
| `renderSocialButtons(options)` | Render OAuth buttons into a DOM element |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| Angular support | Native | Community | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |

## License

MIT
