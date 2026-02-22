# @authon/angular

Angular SDK for [Authon](https://authon.dev) — service, guard, and interceptor.

## Install

```bash
npm install @authon/angular
# or
pnpm add @authon/angular
```

Requires `@angular/core >= 16.0.0`.

## Quick Start

### 1. Import Module

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

### 2. Use the Service

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

Automatically attach the access token to outgoing requests:

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

## API Reference

### `AuthonService`

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `user()` | `Signal<AuthonUser \| null>` | Current user signal |
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

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
