import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService, renderSocialButtons } from '@authon/angular';

type View = 'custom' | 'social';

interface MfaState {
  required: boolean;
  mfaToken?: string;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-centered">
      <div style="width:100%;max-width:500px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            Sign In
          </h1>
          <p style="color:var(--text-secondary);font-size:14px;">
            Sign in to your account
          </p>
        </div>

        <div style="display:flex;justify-content:center;margin-bottom:28px;">
          <div class="toggle-bar">
            <button class="toggle-btn" [class.active]="view === 'custom'" (click)="view = 'custom'">
              Email & Password
            </button>
            <button class="toggle-btn" [class.active]="view === 'social'" (click)="view = 'social'">
              Social Login
            </button>
          </div>
        </div>

        <ng-container *ngIf="view === 'custom'">
          <ng-container *ngIf="!mfa.required; else mfaForm">
            <div class="card">
              <div style="margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span style="font-size:12px;font-weight:600;color:var(--accent-2);background:rgba(79,70,229,0.12);padding:2px 8px;border-radius:5px;">Custom</span>
                  <code style="font-size:12px;color:var(--text-secondary);">client.signInWithEmail(email, password)</code>

                </div>
              </div>

              <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

              <form (ngSubmit)="handleSubmit()" style="display:flex;flex-direction:column;gap:16px;">
                <div class="form-group">
                  <label class="form-label" for="email">Email</label>
                  <input
                    id="email"
                    class="form-input"
                    type="email"
                    placeholder="you@example.com"
                    [(ngModel)]="email"
                    name="email"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="password">Password</label>
                  <input
                    id="password"
                    class="form-input"
                    type="password"
                    placeholder="••••••••"
                    [(ngModel)]="password"
                    name="password"
                    autocomplete="current-password"
                    required
                  />
                  <div style="display:flex;justify-content:flex-end;margin-top:4px;">
                    <a routerLink="/reset-password" style="font-size:13px;color:var(--accent);">Forgot password?</a>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
                  <span *ngIf="loading" class="loading-spinner"></span>
                  <span *ngIf="!loading">Sign in</span>
                </button>
              </form>

              <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
                Don't have an account?
                <a routerLink="/sign-up" style="color:var(--accent);font-weight:600;">Sign up</a>
              </div>
            </div>
          </ng-container>

          <ng-template #mfaForm>
            <div class="card">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:32px;margin-bottom:12px;">🔑</div>
                <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
                  Two-Factor Authentication
                </h2>
                <p style="color:var(--text-secondary);font-size:14px;">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

              <form (ngSubmit)="handleMfaVerify()" style="display:flex;flex-direction:column;gap:16px;">
                <div class="form-group">
                  <label class="form-label">Verification Code</label>
                  <input
                    class="form-input"
                    type="text"
                    inputmode="numeric"
                    maxlength="6"
                    placeholder="000000"
                    [(ngModel)]="mfaCode"
                    name="mfaCode"
                    style="text-align:center;font-size:24px;letter-spacing:0.2em;"
                    autofocus
                  />
                </div>

                <button type="submit" class="btn btn-primary btn-full" [disabled]="loading || mfaCode.length !== 6">
                  <span *ngIf="loading" class="loading-spinner"></span>
                  <span *ngIf="!loading">Verify</span>
                </button>

                <button type="button" class="btn btn-secondary btn-full" (click)="cancelMfa()">
                  Back
                </button>
              </form>
            </div>
          </ng-template>
        </ng-container>

        <ng-container *ngIf="view === 'social'">
          <div class="card">
            <div style="margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-light);padding:2px 8px;border-radius:5px;">Social</span>
                <code style="font-size:12px;color:var(--text-secondary);">renderSocialButtons(&#123; client, container &#125;)</code>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;">
                All 10 enabled OAuth providers — Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.
              </p>
            </div>

            <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

            <div #socialContainer></div>

            <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
              Don't have an account?
              <a routerLink="/sign-up" style="color:var(--accent);font-weight:600;">Sign up</a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class SignInComponent implements AfterViewInit, OnDestroy {
  @ViewChild('socialContainer') socialContainerRef!: ElementRef;

  view: View = 'custom';
  email = '';
  password = '';
  mfaCode = '';
  mfa: MfaState = { required: false };
  loading = false;
  error = '';
  private socialCleanup?: () => void;
  private viewChangeSub?: any;

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.initSocialButtons();
  }

  ngOnDestroy() {
    this.socialCleanup?.();
  }

  private initSocialButtons() {
    if (this.view === 'social' && this.socialContainerRef) {
      this.socialCleanup?.();
      this.socialCleanup = renderSocialButtons({
        client: this.authon.getClient(),
        container: this.socialContainerRef.nativeElement,
        onSuccess: () => this.router.navigate(['/']),
        onError: (err) => {
          this.error = err.message;
          this.cdr.detectChanges();
        },
      });
    }
  }

  setView(v: View) {
    this.view = v;
    this.error = '';
    if (v === 'social') {
      setTimeout(() => this.initSocialButtons(), 0);
    }
  }

  async handleSubmit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    try {
      const client = this.authon.getClient();
      await client.signInWithEmail(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      if (err?.name === 'AuthonMfaRequiredError' || err?.mfaToken) {
        this.mfa = { required: true, mfaToken: err.mfaToken };
      } else {
        this.error = err instanceof Error ? err.message : 'Sign in failed';
      }
    } finally {
      this.loading = false;
    }
  }

  async handleMfaVerify() {
    if (!this.mfa.required || !this.mfa.mfaToken) return;
    this.loading = true;
    this.error = '';
    try {
      const client = this.authon.getClient();
      await client.verifyMfa(this.mfa.mfaToken, this.mfaCode);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'MFA verification failed';
    } finally {
      this.loading = false;
    }
  }

  cancelMfa() {
    this.mfa = { required: false };
    this.mfaCode = '';
    this.error = '';
  }
}
