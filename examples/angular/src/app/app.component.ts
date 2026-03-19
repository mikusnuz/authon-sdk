import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthonService } from '@authon/angular'
import type { AuthonUser } from '@authon/shared'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      @if (isLoading) {
        <div class="loading-page">
          <p>Loading...</p>
        </div>
      } @else if (isSignedIn) {
        <div class="signed-in-layout">
          <div class="topbar">
            <div class="topbar-brand">Authon Example</div>
            <div class="topbar-right">
              <button class="btn btn-outline btn-sm" (click)="signOut()">Sign Out</button>
            </div>
          </div>
          <div class="welcome-content">
            <div class="welcome-card">
              <div class="welcome-avatar">
                <img *ngIf="user?.avatarUrl" [src]="user!.avatarUrl" alt="avatar" />
                <span *ngIf="!user?.avatarUrl">{{ avatarInitials }}</span>
              </div>
              <h2>Welcome back, {{ user?.displayName || (user?.email ?? '').split('@')[0] }}</h2>
              <p class="welcome-email">{{ user?.email }}</p>
              <div class="info-grid">
                <div class="info-row">
                  <span class="info-label">User ID</span>
                  <span class="info-value mono">{{ user?.id }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email verified</span>
                  <span [class]="'info-badge ' + (user?.emailVerified ? 'badge-green' : 'badge-yellow')">
                    {{ user?.emailVerified ? 'Verified' : 'Unverified' }}
                  </span>
                </div>
                @if (user?.displayName) {
                  <div class="info-row">
                    <span class="info-label">Display name</span>
                    <span class="info-value">{{ user!.displayName }}</span>
                  </div>
                }
              </div>
              <button class="btn btn-outline btn-sm" (click)="signOut()">Sign Out</button>
            </div>
          </div>
        </div>
      } @else {
        <div class="hero">
          <div class="badge">&#64;authon/angular SDK</div>
          <h1>Authon Angular Example</h1>
          <p class="subtitle">
            Drop-in authentication for Angular. Branding, OAuth providers,
            and MFA all configured from your Authon dashboard.
          </p>
          <div class="btn-group">
            <button class="btn btn-primary" (click)="openSignIn()">Sign In</button>
            <button class="btn btn-outline" (click)="openSignUp()">Create Account</button>
          </div>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <div class="feature-title">Email + Password</div>
                <div class="feature-desc">Secure sign-in with validation</div>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div class="feature-title">OAuth Providers</div>
                <div class="feature-desc">Google, GitHub, and more</div>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div class="feature-title">Dashboard Branding</div>
                <div class="feature-desc">Logo, colors, fonts from dashboard</div>
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <div class="feature-title">MFA Support</div>
                <div class="feature-desc">TOTP authenticator app</div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private authonService = inject<AuthonService>('AuthonService' as never)
  private cdr = inject(ChangeDetectorRef)
  private unsubscribe: (() => void) | null = null

  isLoading = false
  isSignedIn = false
  user: AuthonUser | null = null

  get avatarInitials(): string {
    const u = this.user
    if (!u) return '?'
    if (u.displayName) {
      return u.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return (u.email?.[0] ?? '?').toUpperCase()
  }

  ngOnInit(): void {
    this.syncState()
    this.unsubscribe = this.authonService.onStateChange(() => {
      this.syncState()
      this.cdr.detectChanges()
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe?.()
  }

  private syncState(): void {
    this.isLoading = this.authonService.isLoading
    this.isSignedIn = this.authonService.isSignedIn
    this.user = this.authonService.user
  }

  openSignIn(): void {
    this.authonService.openSignIn()
  }

  openSignUp(): void {
    this.authonService.openSignUp()
  }

  signOut(): void {
    this.authonService.signOut().then(() => {
      this.syncState()
      this.cdr.detectChanges()
    })
  }
}
