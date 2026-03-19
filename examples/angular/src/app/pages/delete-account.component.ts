import { Component, Inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService } from '@authon/angular';

const CONFIRMATION_TEXT = 'DELETE';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page-centered">
      <div style="width:100%;max-width:480px;">
        <div class="card">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:56px;height:56px;border-radius:50%;background:var(--danger-bg);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">
              ⚠️
            </div>
            <h1 style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
              Delete Account
            </h1>
            <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;">
              This action is <strong style="color:var(--danger);">permanent and irreversible</strong>.
              All your data will be deleted immediately.
            </p>
          </div>

          <div class="alert alert-error" style="margin-bottom:24px;">
            <div style="font-weight:600;margin-bottom:6px;">This will permanently delete:</div>
            <ul style="padding-left:18px;display:flex;flex-direction:column;gap:4px;margin-top:4px;">
              <li>Your account and personal information</li>
              <li>All active sessions</li>
              <li>MFA configuration and backup codes</li>
              <li>Any linked social accounts</li>
            </ul>
          </div>

          <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label" for="confirm">
              Type <strong style="color:var(--danger);font-family:'Courier New',monospace;">DELETE</strong> to confirm
            </label>
            <input
              id="confirm"
              class="form-input"
              type="text"
              placeholder="DELETE"
              [(ngModel)]="confirmInput"
              name="confirm"
              [style.border-color]="isConfirmed ? 'var(--danger)' : ''"
              style="text-align:center;font-family:'Courier New',monospace;letter-spacing:0.1em;font-size:16px;"
            />
          </div>

          <button
            class="btn btn-danger btn-full"
            (click)="handleDelete()"
            [disabled]="!isConfirmed || loading"
            [style.opacity]="isConfirmed ? '1' : '0.4'"
            style="margin-bottom:12px;"
          >
            <span *ngIf="loading" class="loading-spinner"></span>
            <span *ngIf="!loading">Permanently delete my account</span>
          </button>

          <a routerLink="/profile" class="btn btn-secondary btn-full">
            Cancel — Keep my account
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DeleteAccountComponent {
  confirmInput = '';
  loading = false;
  error = '';

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private router: Router,
  ) {}

  get isConfirmed(): boolean {
    return this.confirmInput === CONFIRMATION_TEXT;
  }

  async handleDelete() {
    if (!this.isConfirmed) return;
    this.loading = true;
    this.error = '';
    try {
      await this.authon.signOut();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Failed to delete account';
      this.loading = false;
    }
  }
}
