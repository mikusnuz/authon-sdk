# @authup/angular

Angular SDK for [Authup](https://authup.dev) — service, guard, and interceptor.

## Install

```bash
npm install @authup/angular
# or
pnpm add @authup/angular
```

Requires `@angular/core >= 16.0.0`.

## Quick Start

### 1. Import Module

```ts
// app.config.ts
import { provideAuthup } from '@authup/angular';

export const appConfig = {
  providers: [
    provideAuthup({
      publishableKey: 'pk_live_...',
    }),
  ],
};
```

### 2. Use the Service

```ts
import { Component } from '@angular/core';
import { AuthupService } from '@authup/angular';

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
  constructor(public auth: AuthupService) {}
}
```

### 3. Route Guard

```ts
// app.routes.ts
import { authGuard } from '@authup/angular';

export const routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
];
```

### 4. HTTP Interceptor

Automatically attach the access token to outgoing requests:

```ts
// app.config.ts
import { provideAuthup, authInterceptor } from '@authup/angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideAuthup({ publishableKey: 'pk_live_...' }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

## API Reference

### `AuthupService`

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `user()` | `Signal<AuthupUser \| null>` | Current user signal |
| `isSignedIn()` | `Signal<boolean>` | Whether signed in |
| `isLoading()` | `Signal<boolean>` | Loading state |
| `openSignIn()` | `Promise<void>` | Open sign-in modal |
| `openSignUp()` | `Promise<void>` | Open sign-up modal |
| `signOut()` | `Promise<void>` | Sign out |
| `getToken()` | `string \| null` | Get current access token |

### Guard

| Export | Description |
|--------|-------------|
| `authGuard` | `CanActivateFn` that redirects unauthenticated users |

### Interceptor

| Export | Description |
|--------|-------------|
| `authInterceptor` | `HttpInterceptorFn` that adds Bearer token to requests |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
