import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService } from '@authon/angular';

type Step = 'email' | 'sent';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-centered">
      <div style="width:100%;max-width:440px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:40px;margin-bottom:16px;">🔒</div>
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            Reset Password
          </h1>
          <p style="color:var(--text-secondary);font-size:14px;max-width:340px;margin:0 auto;">
            {{ step === 'email'
              ? "Enter your email and we'll send you a magic link to reset your password."
              : 'Check your inbox for the reset link.' }}
          </p>
        </div>

        <ng-container *ngIf="step === 'email'">
          <div class="card">
            <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px;">
              <code style="color:var(--accent);">client.sendMagicLink(email)</code>
            </div>

            <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

            <form (ngSubmit)="handleSubmit()" style="display:flex;flex-direction:column;gap:16px;">
              <div class="form-group">
                <label class="form-label" for="email">Email address</label>
                <input
                  id="email"
                  class="form-input"
                  type="email"
                  placeholder="you@example.com"
                  [(ngModel)]="email"
                  name="email"
                  autocomplete="email"
                  autofocus
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
                <span *ngIf="loading" class="loading-spinner"></span>
                <span *ngIf="!loading">Send reset link</span>
              </button>
            </form>

            <div style="margin-top:20px;text-align:center;font-size:14px;">
              <a routerLink="/sign-in" style="color:var(--text-secondary);">Back to sign in</a>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="step === 'sent'">
          <div class="card" style="text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">✉️</div>
            <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
              Check your email
            </h2>
            <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px;line-height:1.6;">
              We sent a magic link to <strong style="color:var(--text-primary);">{{ email }}</strong>.
              Click the link to reset your password. The link expires in 15 minutes.
            </p>

            <div class="alert alert-warning" style="text-align:left;margin-bottom:20px;">
              <strong>Did not receive the email?</strong> Check your spam folder or try again.
            </div>

            <div style="display:flex;gap:10px;justify-content:center;">
              <button class="btn btn-secondary" (click)="retry()">Try again</button>
              <a routerLink="/sign-in" class="btn btn-primary">Back to sign in</a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent {
  step: Step = 'email';
  email = '';
  loading = false;
  error = '';

  constructor(@Inject('AuthonService') private authon: AuthonService) {}

  async handleSubmit() {
    if (!this.email) return;
    this.loading = true;
    this.error = '';
    try {
      const client = this.authon.getClient();
      await client.sendMagicLink(this.email);
      this.step = 'sent';
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Failed to send reset email';
    } finally {
      this.loading = false;
    }
  }

  retry() {
    this.step = 'email';
    this.error = '';
  }
}
