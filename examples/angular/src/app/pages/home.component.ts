import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthonService } from '@authon/angular';

const FEATURES = [
  {
    icon: '🔐',
    title: 'Email & Password Auth',
    desc: 'Full sign-in / sign-up flow with validation and error handling.',
  },
  {
    icon: '🌐',
    title: 'Social Login (10 providers)',
    desc: 'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.',
  },
  {
    icon: '🛡️',
    title: 'Angular Standalone Components',
    desc: 'Full auth flow using Angular 19 standalone components and AuthonService.',
  },
  {
    icon: '🔑',
    title: 'Two-Factor Auth (MFA)',
    desc: 'TOTP authenticator app setup with QR code and backup codes.',
  },
  {
    icon: '📱',
    title: 'Session Management',
    desc: 'List all active sessions across devices, revoke any session.',
  },
  {
    icon: '👤',
    title: 'Profile Management',
    desc: 'Update display name, avatar URL, phone number via updateProfile().',
  },
  {
    icon: '🚦',
    title: 'Route Guards',
    desc: 'authGuard() — protect routes with Angular CanActivateFn.',
  },
  {
    icon: '🔒',
    title: 'Password Reset',
    desc: 'Send magic link for password reset via sendMagicLink().',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page">
      <div style="text-align:center;padding:60px 0 48px;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:99px;background:var(--accent-light);border:1px solid rgba(124,58,237,0.3);font-size:13px;color:var(--accent);font-weight:600;margin-bottom:24px;">
          <span>v0.3.0</span>
          <span style="opacity:0.5;">|</span>
          <span>Reference Implementation</span>
        </div>

        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.15;letter-spacing:-0.03em;margin-bottom:20px;background:linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
          Authon Angular SDK<br>Example App
        </h1>

        <p style="font-size:18px;color:var(--text-secondary);max-width:560px;margin:0 auto 40px;line-height:1.6;">
          Complete authentication flow demo using
          <code style="color:var(--accent);background:var(--accent-light);padding:2px 8px;border-radius:5px;font-size:15px;">&#64;authon/angular</code>.
          Every feature of the SDK — demonstrated and ready to copy.
        </p>

        <ng-container *ngIf="!isSignedIn">
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <a routerLink="/sign-in" class="btn btn-primary" style="font-size:15px;padding:12px 28px;border-radius:10px;">
              Sign in
            </a>
            <a routerLink="/sign-up" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">
              Create account
            </a>
          </div>
        </ng-container>

        <ng-container *ngIf="isSignedIn">
          <div style="display:inline-flex;align-items:center;gap:12px;padding:14px 24px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:20px;">
            <div class="avatar">
              <img *ngIf="user?.avatarUrl" [src]="user!.avatarUrl" alt="avatar" />
              <span *ngIf="!user?.avatarUrl">{{ initials }}</span>
            </div>
            <div style="text-align:left;">
              <div style="font-weight:600;color:var(--text-primary);">
                Welcome back, {{ user?.displayName || user?.email?.split('@')[0] }}!
              </div>
              <div style="font-size:13px;color:var(--text-secondary);">{{ user?.email }}</div>
            </div>
          </div>
          <br>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <a routerLink="/profile" class="btn btn-primary" style="font-size:15px;padding:12px 28px;border-radius:10px;">
              View Profile
            </a>
            <a routerLink="/mfa" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">
              MFA Setup
            </a>
            <a routerLink="/sessions" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">
              Sessions
            </a>
          </div>
          <div style="margin-top:16px;" *ngIf="user?.emailVerified">
            <span class="badge badge-success">Email verified</span>
          </div>
          <div style="margin-top:16px;" *ngIf="isSignedIn && !user?.emailVerified">
            <p style="color:var(--warning);font-size:13px;">Your email is not verified.</p>
          </div>
        </ng-container>
      </div>

      <div style="margin-bottom:48px;">
        <h2 style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:8px;text-align:center;">
          Features Demonstrated
        </h2>
        <p style="text-align:center;color:var(--text-secondary);font-size:14px;margin-bottom:28px;">
          Navigate to each page to see the feature in action
        </p>
        <div class="feature-grid">
          <div *ngFor="let f of features" class="feature-card">
            <div class="feature-icon">{{ f.icon }}</div>
            <div class="feature-title">{{ f.title }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:48px;">
        <div class="section-title">Quick Start</div>
        <pre style="background:var(--bg-0);border:1px solid var(--border);border-radius:8px;padding:16px 20px;font-size:13px;color:#93c5fd;overflow:auto;line-height:1.7;font-family:'Courier New',monospace;">{{ quickStartCode }}</pre>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  isSignedIn = false;
  user: any = null;
  features = FEATURES;
  private unsubscribe?: () => void;

  quickStartCode = `import { provideAuthon, AuthonService } from '@authon/angular'

// app.config.ts
export const appConfig = {
  providers: [
    ...provideAuthon({ publishableKey: 'your-project-id' }),
  ],
}

// component
export class MyComponent {
  constructor(@Inject('AuthonService') private authon: AuthonService) {}

  signIn() {
    this.authon.getClient().signInWithEmail(email, password)
  }
}`;

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private cdr: ChangeDetectorRef,
  ) {}

  get initials(): string {
    if (this.user?.displayName) {
      return this.user.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return (this.user?.email?.[0] ?? '?').toUpperCase();
  }

  ngOnInit() {
    this.isSignedIn = this.authon.isSignedIn;
    this.user = this.authon.user;

    this.unsubscribe = this.authon.onStateChange(() => {
      this.isSignedIn = this.authon.isSignedIn;
      this.user = this.authon.user;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
