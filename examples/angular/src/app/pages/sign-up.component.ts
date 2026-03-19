import {
  Component,
  Inject,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService, renderSocialButtons } from '@authon/angular';

type View = 'custom' | 'social';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-centered">
      <div style="width:100%;max-width:500px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            Create Account
          </h1>
          <p style="color:var(--text-secondary);font-size:14px;">
            Sign up for a new account
          </p>
        </div>

        <div style="display:flex;justify-content:center;margin-bottom:28px;">
          <div class="toggle-bar">
            <button class="toggle-btn" [class.active]="view === 'custom'" (click)="setView('custom')">
              Email & Password
            </button>
            <button class="toggle-btn" [class.active]="view === 'social'" (click)="setView('social')">
              Social Sign Up
            </button>
          </div>
        </div>

        <ng-container *ngIf="view === 'custom'">
          <div class="card">
            <div style="margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:600;color:var(--accent-2);background:rgba(79,70,229,0.12);padding:2px 8px;border-radius:5px;">Custom</span>
                <code style="font-size:12px;color:var(--text-secondary);">client.signUpWithEmail(email, password, meta)</code>
              </div>
            </div>

            <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

            <form (ngSubmit)="handleSubmit()" style="display:flex;flex-direction:column;gap:16px;">
              <div class="form-group">
                <label class="form-label" for="displayName">
                  Display Name <span style="color:var(--text-tertiary);">(optional)</span>
                </label>
                <input
                  id="displayName"
                  class="form-input"
                  type="text"
                  placeholder="Your name"
                  [(ngModel)]="displayName"
                  name="displayName"
                  autocomplete="name"
                />
              </div>

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
                  placeholder="Minimum 8 characters"
                  [(ngModel)]="password"
                  name="password"
                  autocomplete="new-password"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  class="form-input"
                  type="password"
                  placeholder="Repeat your password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  autocomplete="new-password"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
                <span *ngIf="loading" class="loading-spinner"></span>
                <span *ngIf="!loading">Create account</span>
              </button>
            </form>

            <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
              Already have an account?
              <a routerLink="/sign-in" style="color:var(--accent);font-weight:600;">Sign in</a>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="view === 'social'">
          <div class="card">
            <div style="margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-light);padding:2px 8px;border-radius:5px;">Social</span>
                <code style="font-size:12px;color:var(--text-secondary);">renderSocialButtons(&#123; client, container &#125;)</code>
              </div>
              <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;">
                Sign up instantly with your existing social account.
              </p>
            </div>

            <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

            <div #socialContainer></div>

            <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
              Already have an account?
              <a routerLink="/sign-in" style="color:var(--accent);font-weight:600;">Sign in</a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class SignUpComponent implements AfterViewInit, OnDestroy {
  @ViewChild('socialContainer') socialContainerRef!: ElementRef;

  view: View = 'custom';
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  private socialCleanup?: () => void;

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    if (this.view === 'social') {
      this.initSocialButtons();
    }
  }

  ngOnDestroy() {
    this.socialCleanup?.();
  }

  setView(v: View) {
    this.view = v;
    this.error = '';
    if (v === 'social') {
      setTimeout(() => this.initSocialButtons(), 0);
    }
  }

  private initSocialButtons() {
    if (this.socialContainerRef) {
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

  async handleSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const client = this.authon.getClient();
      await client.signUpWithEmail(this.email, this.password, {
        displayName: this.displayName || undefined,
      });
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Sign up failed';
    } finally {
      this.loading = false;
    }
  }
}
