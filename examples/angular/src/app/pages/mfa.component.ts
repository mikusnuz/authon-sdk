import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService } from '@authon/angular';

type SetupStep = 'idle' | 'qr' | 'verify' | 'done';

interface MfaStatus {
  enabled: boolean;
  backupCodesRemaining?: number;
}

interface QrData {
  secret: string;
  qrCodeSvg: string;
  backupCodes: string[];
}

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" style="max-width:640px;">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
          Two-Factor Authentication
        </h1>
        <p style="color:var(--text-secondary);font-size:14px;">
          Add an extra layer of security using
          <code style="color:var(--accent);">authon.getClient().setupMfa()</code>
        </p>
      </div>

      <ng-container *ngIf="statusLoading">
        <div style="display:flex;justify-content:center;padding:60px 0;">
          <div class="loading-spinner-lg"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!statusLoading">
        <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="localError">{{ localError }}</div>
        <div class="alert alert-success" style="margin-bottom:16px;" *ngIf="successMsg">{{ successMsg }}</div>

        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div>
              <div style="font-size:16px;font-weight:600;color:var(--text-primary);">Authenticator App</div>
              <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">
                {{ mfaStatus?.enabled
                  ? 'Active — ' + (mfaStatus?.backupCodesRemaining || 0) + ' backup codes remaining'
                  : 'Not configured' }}
              </div>
            </div>
            <span class="badge" [class.badge-success]="mfaStatus?.enabled" [class.badge-muted]="!mfaStatus?.enabled">
              <span style="width:6px;height:6px;border-radius:50%;display:inline-block;"
                [style.background]="mfaStatus?.enabled ? 'var(--success)' : 'var(--text-tertiary)'"></span>
              {{ mfaStatus?.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>

          <ng-container *ngIf="!mfaStatus?.enabled && setupStep === 'idle'">
            <button class="btn btn-primary" (click)="handleSetupStart()" [disabled]="isLoading">
              <span *ngIf="isLoading" class="loading-spinner"></span>
              <span *ngIf="!isLoading">Set up authenticator app</span>
            </button>
          </ng-container>

          <ng-container *ngIf="setupStep === 'qr' && qrData">
            <div class="alert alert-warning" style="margin-bottom:20px;">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </div>

            <div class="qr-container" style="margin-bottom:20px;">
              <div [innerHTML]="qrData.qrCodeSvg"></div>
              <div style="font-size:13px;color:var(--text-secondary);text-align:center;">
                Or enter manually:
                <div style="font-family:'Courier New',monospace;font-size:14px;color:var(--text-primary);margin-top:6px;word-break:break-all;padding:8px 12px;background:var(--bg-card);border-radius:6px;border:1px solid var(--border);">
                  {{ qrData.secret }}
                </div>
              </div>
            </div>

            <div *ngIf="qrData.backupCodes.length > 0" style="margin-bottom:20px;">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                Backup Codes — Save these now
              </div>
              <div class="alert alert-warning" style="margin-bottom:12px;font-size:12px;">
                Store backup codes safely. Each code can only be used once.
              </div>
              <div class="backup-codes-grid">
                <div *ngFor="let code of qrData.backupCodes" class="backup-code">{{ code }}</div>
              </div>
            </div>

            <button class="btn btn-secondary btn-full" style="margin-bottom:12px;" (click)="setupStep = 'verify'">
              I've scanned the QR code — Next
            </button>
          </ng-container>

          <ng-container *ngIf="setupStep === 'verify'">
            <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">
              Enter the 6-digit code from your authenticator app
            </div>
            <div style="display:flex;gap:10px;align-items:flex-end;">
              <div class="form-group" style="flex:1;">
                <input
                  class="form-input"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="000000"
                  [(ngModel)]="verifyCode"
                  name="verifyCode"
                  style="text-align:center;font-size:20px;letter-spacing:0.2em;"
                  autofocus
                />
              </div>
              <button
                class="btn btn-primary"
                (click)="handleVerifySetup()"
                [disabled]="isLoading || verifyCode.length !== 6"
                style="flex-shrink:0;"
              >
                <span *ngIf="isLoading" class="loading-spinner"></span>
                <span *ngIf="!isLoading">Verify &amp; Enable</span>
              </button>
            </div>
          </ng-container>

          <ng-container *ngIf="setupStep === 'done' && mfaStatus?.enabled">
            <div class="alert alert-success">MFA is now active on your account!</div>
          </ng-container>

          <ng-container *ngIf="mfaStatus?.enabled && setupStep === 'idle'">
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" (click)="showRegen = true; showDisable = false;">
                Regenerate backup codes
              </button>
              <button class="btn btn-danger btn-sm" (click)="showDisable = true; showRegen = false;">
                Disable MFA
              </button>
            </div>
          </ng-container>
        </div>

        <div *ngIf="showDisable" class="card" style="margin-bottom:20px;">
          <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Disable MFA</div>
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">
            Enter your current TOTP code to confirm.
            <code style="color:var(--accent);">disableMfa(code)</code>
          </p>
          <div style="display:flex;gap:10px;align-items:flex-end;">
            <div class="form-group" style="flex:1;">
              <input
                class="form-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="000000"
                [(ngModel)]="disableCode"
                name="disableCode"
                style="text-align:center;letter-spacing:0.15em;"
              />
            </div>
            <button class="btn btn-danger" (click)="handleDisable()" [disabled]="isLoading || disableCode.length !== 6">
              <span *ngIf="isLoading" class="loading-spinner"></span>
              <span *ngIf="!isLoading">Disable</span>
            </button>
            <button class="btn btn-secondary" (click)="showDisable = false; disableCode = '';">Cancel</button>
          </div>
        </div>

        <div *ngIf="showRegen" class="card" style="margin-bottom:20px;">
          <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Regenerate Backup Codes</div>
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">
            Enter your TOTP code to generate new backup codes.
            <code style="color:var(--accent);">regenerateBackupCodes(code)</code>
          </p>
          <div style="display:flex;gap:10px;align-items:flex-end;">
            <div class="form-group" style="flex:1;">
              <input
                class="form-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="000000"
                [(ngModel)]="regenCode"
                name="regenCode"
                style="text-align:center;letter-spacing:0.15em;"
              />
            </div>
            <button class="btn btn-primary" (click)="handleRegenerate()" [disabled]="isLoading || regenCode.length !== 6">
              <span *ngIf="isLoading" class="loading-spinner"></span>
              <span *ngIf="!isLoading">Regenerate</span>
            </button>
            <button class="btn btn-secondary" (click)="showRegen = false; regenCode = '';">Cancel</button>
          </div>
        </div>

        <div *ngIf="newBackupCodes" class="card">
          <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">New Backup Codes</div>
          <div class="alert alert-warning" style="margin-bottom:12px;font-size:12px;">
            Previous backup codes have been invalidated. Save these new codes safely.
          </div>
          <div class="backup-codes-grid">
            <div *ngFor="let code of newBackupCodes" class="backup-code">{{ code }}</div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class MfaComponent implements OnInit {
  mfaStatus: MfaStatus | null = null;
  statusLoading = true;
  setupStep: SetupStep = 'idle';
  qrData: QrData | null = null;
  verifyCode = '';
  disableCode = '';
  showDisable = false;
  regenCode = '';
  showRegen = false;
  newBackupCodes: string[] | null = null;
  isLoading = false;
  localError = '';
  successMsg = '';

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.loadStatus();
  }

  async loadStatus() {
    this.statusLoading = true;
    try {
      const client = this.authon.getClient();
      const status = await client.getMfaStatus();
      this.mfaStatus = status;
    } catch {
      this.mfaStatus = { enabled: false };
    } finally {
      this.statusLoading = false;
      this.cdr.detectChanges();
    }
  }

  async handleSetupStart() {
    this.localError = '';
    this.isLoading = true;
    try {
      const client = this.authon.getClient();
      const data = await client.setupMfa();
      this.qrData = {
        secret: data.secret,
        qrCodeSvg: data.qrCodeSvg,
        backupCodes: data.backupCodes,
      };
      this.setupStep = 'qr';
    } catch (err: any) {
      this.localError = err instanceof Error ? err.message : 'Failed to start MFA setup';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async handleVerifySetup() {
    this.localError = '';
    this.isLoading = true;
    try {
      const client = this.authon.getClient();
      await client.verifyMfaSetup(this.verifyCode);
      this.setupStep = 'done';
      this.successMsg = 'MFA enabled successfully!';
      await this.loadStatus();
    } catch (err: any) {
      this.localError = err instanceof Error ? err.message : 'Invalid code. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async handleDisable() {
    this.localError = '';
    this.isLoading = true;
    try {
      const client = this.authon.getClient();
      await client.disableMfa(this.disableCode);
      this.showDisable = false;
      this.disableCode = '';
      this.successMsg = 'MFA has been disabled.';
      await this.loadStatus();
    } catch (err: any) {
      this.localError = err instanceof Error ? err.message : 'Invalid code';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async handleRegenerate() {
    this.localError = '';
    this.isLoading = true;
    try {
      const client = this.authon.getClient();
      const codes = await client.regenerateBackupCodes(this.regenCode);
      this.newBackupCodes = codes;
      this.showRegen = false;
      this.regenCode = '';
      this.successMsg = 'Backup codes regenerated.';
    } catch (err: any) {
      this.localError = err instanceof Error ? err.message : 'Failed to regenerate backup codes';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
