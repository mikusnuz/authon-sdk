**English** | [한국어](./README.ko.md)

# @authon/angular

Angular integration for [Authon](https://authon.dev) — service-based auth state, route guard, and social login buttons.

## Install

```bash
npm install @authon/angular @authon/js
```

Requires `@angular/core >= 16.0.0`.

## Setup

### Standalone components (recommended)

Use `provideAuthon()` in `app.config.ts`:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideAuthon } from '@authon/angular'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ...provideAuthon({ publishableKey: 'pk_live_...' }),
  ],
}
```

### NgModule-based apps

Create an injectable service that wraps `AuthonService`:

```ts
// authon.service.ts
import { Injectable } from '@angular/core'
import { AuthonService as BaseAuthonService } from '@authon/angular'

@Injectable({ providedIn: 'root' })
export class AuthonService extends BaseAuthonService {
  constructor() {
    super({ publishableKey: 'pk_live_...' })
  }
}
```

## Inject the service

After setup with `provideAuthon()`:

```ts
import { Inject } from '@angular/core'
import { AuthonService } from '@authon/angular'

constructor(@Inject('AuthonService') private authon: AuthonService) {}
```

Or with your own injectable wrapper:

```ts
import { AuthonService } from './authon.service'

constructor(private authon: AuthonService) {}
```

## API Reference

### `AuthonService`

| Property / Method | Type | Description |
|---|---|---|
| `user` | `AuthonUser \| null` | Current user (getter) |
| `isSignedIn` | `boolean` | Whether the user is signed in (getter) |
| `isLoading` | `boolean` | Whether auth state is loading (getter) |
| `openSignIn()` | `Promise<void>` | Open the Authon sign-in modal |
| `openSignUp()` | `Promise<void>` | Open the Authon sign-up modal |
| `signOut()` | `Promise<void>` | Sign out the current user |
| `getToken()` | `string \| null` | Get the current access token |
| `getClient()` | `Authon` | Get the underlying `@authon/js` client instance |
| `onStateChange(cb)` | `() => void` | Subscribe to auth state changes; returns unsubscribe function |
| `destroy()` | `void` | Clean up listeners and session |

### `authGuard(authonService, redirectTo?)`

Route guard factory. Returns `true` if signed in, `{ path: redirectTo }` if not.

```ts
import { inject } from '@angular/core'
import { authGuard } from '@authon/angular'

// In routes
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [() => {
    const authon = inject(AuthonService)
    return authGuard(authon, '/login')
  }],
}
```

`redirectTo` defaults to `'/sign-in'`.

### `provideAuthon(config)`

Provider factory for standalone Angular apps. Returns an array of Angular providers.

```ts
...provideAuthon({
  publishableKey: 'pk_live_...',
  config: {
    theme: 'auto',
    locale: 'en',
  },
})
```

### `renderSocialButtons(options)`

Renders branded OAuth provider buttons into a DOM element. Returns a cleanup function.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `client` | `Authon` | required | Authon client instance |
| `container` | `HTMLElement` | required | Target DOM element |
| `onSuccess` | `() => void` | — | Called after successful OAuth sign-in |
| `onError` | `(error: Error) => void` | — | Called on OAuth error |
| `compact` | `boolean` | `false` | Icon-only square buttons in a row |
| `gap` | `number` | `10` / `12` | Gap between buttons in px |
| `labels` | `Record<provider, string>` | — | Override button labels per provider |
| `borderRadius` | `number` | `10` | Button border radius in px |
| `height` | `number` | `48` | Button height in px |
| `size` | `number` | `48` | Icon button size in px (compact mode) |

## Examples

### Auth-aware header component

```ts
import { Component, ChangeDetectorRef, OnInit, OnDestroy, Inject } from '@angular/core'
import { AuthonService } from '@authon/angular'

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <nav>
      <ng-container *ngIf="!authon.isLoading">
        <span *ngIf="authon.isSignedIn">
          Hello, {{ authon.user?.displayName }}
          <button (click)="signOut()">Sign out</button>
        </span>
        <button *ngIf="!authon.isSignedIn" (click)="authon.openSignIn()">
          Sign in
        </button>
      </ng-container>
    </nav>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unsubscribe?: () => void

  constructor(
    @Inject('AuthonService') public authon: AuthonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.unsubscribe = this.authon.onStateChange(() => this.cdr.markForCheck())
  }

  ngOnDestroy() {
    this.unsubscribe?.()
  }

  async signOut() {
    await this.authon.signOut()
  }
}
```

### Login component with email + OAuth

```ts
import {
  Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthonService, renderSocialButtons } from '@authon/angular'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div #socialContainer></div>

    <form (ngSubmit)="handleSignIn()">
      <input [(ngModel)]="email" name="email" type="email" placeholder="Email" />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" />
      <button type="submit" [disabled]="loading">Sign in</button>
      <p *ngIf="error">{{ error }}</p>
    </form>
  `,
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('socialContainer') socialContainer!: ElementRef
  email = ''
  password = ''
  loading = false
  error = ''
  private cleanupSocial?: () => void

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private router: Router,
  ) {}

  ngAfterViewInit() {
    this.cleanupSocial = renderSocialButtons({
      client: this.authon.getClient(),
      container: this.socialContainer.nativeElement,
      onSuccess: () => this.router.navigate(['/dashboard']),
      onError: (e) => { this.error = e.message },
    })
  }

  ngOnDestroy() {
    this.cleanupSocial?.()
  }

  async handleSignIn() {
    this.loading = true
    this.error = ''
    try {
      await this.authon.getClient().signInWithEmail(this.email, this.password)
      this.router.navigate(['/dashboard'])
    } catch (e: any) {
      this.error = e.message
    } finally {
      this.loading = false
    }
  }
}
```

### Route guard

```ts
// app.routes.ts
import { Routes } from '@angular/router'
import { inject } from '@angular/core'
import { authGuard } from '@authon/angular'
import { AuthonService } from '@authon/angular'

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => {
      const authon = inject(AuthonService) as AuthonService
      return authGuard(authon, '/login')
    }],
  },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
]
```

### OAuth sign-in

```ts
async signInWithGoogle() {
  await this.authon.getClient().signInWithOAuth('google')
}
```

### MFA setup

```ts
import { Component, Inject } from '@angular/core'
import { AuthonService } from '@authon/angular'

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  template: `
    <button (click)="initMfaSetup()">Enable MFA</button>
    <div *ngIf="qrCodeSvg" [innerHTML]="qrCodeSvg"></div>
    <p *ngIf="secret">Secret: {{ secret }}</p>
    <ul><li *ngFor="let code of backupCodes">{{ code }}</li></ul>
    <input [(ngModel)]="verifyCode" placeholder="6-digit code" />
    <button (click)="confirmSetup()">Verify</button>
  `,
})
export class MfaSetupComponent {
  qrCodeSvg = ''
  secret = ''
  backupCodes: string[] = []
  verifyCode = ''

  constructor(@Inject('AuthonService') private authon: AuthonService) {}

  async initMfaSetup() {
    const res = await this.authon.getClient().setupMfa()
    this.qrCodeSvg = res.qrCodeSvg
    this.secret = res.secret
    this.backupCodes = res.backupCodes
  }

  async confirmSetup() {
    await this.authon.getClient().verifyMfaSetup(this.verifyCode)
    alert('MFA enabled')
  }
}
```

### MFA verification on sign-in

```ts
import { AuthonMfaRequiredError } from '@authon/js'

async signIn(email: string, password: string) {
  try {
    await this.authon.getClient().signInWithEmail(email, password)
  } catch (e) {
    if (e instanceof AuthonMfaRequiredError) {
      this.mfaToken = e.mfaToken  // show TOTP input
    }
  }
}

async verifyMfa(code: string) {
  await this.authon.getClient().verifyMfa(this.mfaToken, code)
}
```

### Passwordless — magic link

```ts
async sendMagicLink(email: string) {
  await this.authon.getClient().sendMagicLink(email)
  this.linkSent = true
}
```

### Passwordless — email OTP

```ts
async sendOtp(email: string) {
  await this.authon.getClient().sendEmailOtp(email)
  this.step = 'verify'
}

async verifyOtp(email: string, code: string) {
  const user = await this.authon.getClient().verifyPasswordless({ email, code })
  console.log('Signed in as:', user.email)
}
```

### Passkeys

```ts
// Register a passkey (user must be signed in)
async registerPasskey() {
  const credential = await this.authon.getClient().registerPasskey('My Device')
  console.log('Registered:', credential.id)
}

// Authenticate with passkey
async loginWithPasskey() {
  const user = await this.authon.getClient().authenticateWithPasskey()
  console.log('Signed in as:', user.email)
}

// List registered passkeys
async listPasskeys() {
  const keys = await this.authon.getClient().listPasskeys()
  console.log(keys)
}
```

### Web3 wallet authentication

```ts
async signInWithWallet() {
  const address = '0xYourWalletAddress'

  // 1. Get a nonce + signable message
  const { nonce, message } = await this.authon.getClient().web3GetNonce(
    address, 'evm', 'metamask',
  )

  // 2. Sign the message with the wallet
  const signature = await (window as any).ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  })

  // 3. Verify and sign in
  const user = await this.authon.getClient().web3Verify(
    message, signature, address, 'evm', 'metamask',
  )
  console.log('Signed in as:', user.email)
}

async listLinkedWallets() {
  const wallets = await this.authon.getClient().listWallets()
  console.log(wallets)
}
```

### Profile update

```ts
async saveProfile() {
  const updated = await this.authon.getClient().updateProfile({
    displayName: 'Jane Doe',
    avatarUrl: 'https://example.com/avatar.png',
    phone: '+1234567890',
    publicMetadata: { role: 'admin' },
  })
  console.log('Updated user:', updated)
}
```

### Session management

```ts
import type { SessionInfo } from '@authon/shared'

sessions: SessionInfo[] = []

async loadSessions() {
  this.sessions = await this.authon.getClient().listSessions()
}

async revokeSession(sessionId: string) {
  await this.authon.getClient().revokeSession(sessionId)
  this.sessions = this.sessions.filter(s => s.id !== sessionId)
}
```

## Change detection

`AuthonService` is a plain class — it does not participate in Angular's change detection automatically. Use `onStateChange` to detect auth state changes and trigger `ChangeDetectorRef.markForCheck()`:

```ts
ngOnInit() {
  this.unsubscribe = this.authon.onStateChange(() => {
    this.cdr.markForCheck()
  })
}

ngOnDestroy() {
  this.unsubscribe?.()
  this.authon.destroy()
}
```

## Service config options

| Option | Type | Default | Description |
|---|---|---|---|
| `publishableKey` | `string` | required | Your Authon publishable key |
| `config.theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `config.locale` | `string` | `'en'` | Language code |
| `config.apiUrl` | `string` | `'https://api.authon.dev'` | Custom API base URL |
| `config.appearance` | `Partial<BrandingConfig>` | — | Override branding colors and logo |

## TypeScript

```ts
import type { AuthonServiceConfig, SocialButtonsConfig } from '@authon/angular'
import type { AuthonUser, SessionInfo, PasskeyCredential, Web3Wallet } from '@authon/shared'
```

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
