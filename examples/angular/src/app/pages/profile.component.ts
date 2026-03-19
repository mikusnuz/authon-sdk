import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthonService } from '@authon/angular';

type View = 'custom';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Profile</h1>
        <p style="color:var(--text-secondary);font-size:14px;">View and edit your account details</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;" class="profile-grid">
        <div>
          <div class="card" style="margin-bottom:16px;">
            <div class="section-title">Account Info</div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div class="avatar avatar-lg">
                <img *ngIf="user?.avatarUrl" [src]="user!.avatarUrl" alt="avatar" />
                <span *ngIf="!user?.avatarUrl">{{ initials }}</span>
              </div>
              <div>
                <div style="font-weight:700;font-size:18px;color:var(--text-primary);">
                  {{ user?.displayName || 'No display name' }}
                </div>
                <div style="color:var(--text-secondary);font-size:14px;">{{ user?.email }}</div>
                <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                  <span *ngIf="user?.emailVerified" class="badge badge-success">Email verified</span>
                  <span *ngIf="!user?.emailVerified" class="badge badge-muted">Not verified</span>
                </div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;gap:8px;align-items:baseline;">
                <span style="font-size:13px;color:var(--text-tertiary);min-width:70px;">User ID</span>
                <span style="font-size:13px;color:var(--text-secondary);font-family:'Courier New',monospace;word-break:break-all;">{{ user?.id || '-' }}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:baseline;">
                <span style="font-size:13px;color:var(--text-tertiary);min-width:70px;">Email</span>
                <span style="font-size:13px;color:var(--text-secondary);">{{ user?.email || '-' }}</span>
              </div>
              <div *ngIf="user?.phone" style="display:flex;gap:8px;align-items:baseline;">
                <span style="font-size:13px;color:var(--text-tertiary);min-width:70px;">Phone</span>
                <span style="font-size:13px;color:var(--text-secondary);">{{ user.phone }}</span>
              </div>
              <div *ngIf="joinDate" style="display:flex;gap:8px;align-items:baseline;">
                <span style="font-size:13px;color:var(--text-tertiary);min-width:70px;">Joined</span>
                <span style="font-size:13px;color:var(--text-secondary);">{{ joinDate }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="section-title">Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a routerLink="/mfa" class="btn btn-secondary" style="justify-content:flex-start;gap:10px;">
                <span>🔑</span><span>Two-Factor Authentication</span>
              </a>
              <a routerLink="/sessions" class="btn btn-secondary" style="justify-content:flex-start;gap:10px;">
                <span>📱</span><span>Active Sessions</span>
              </a>
              <a routerLink="/delete-account" class="btn btn-danger" style="justify-content:flex-start;gap:10px;">
                <span>⚠️</span><span>Delete Account</span>
              </a>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Edit Profile</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px;">
            <code style="color:var(--accent);">client.updateProfile(&#123; displayName, avatarUrl, phone &#125;)</code>
          </div>

          <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>
          <div class="alert alert-success" style="margin-bottom:16px;" *ngIf="success">{{ success }}</div>

          <form (ngSubmit)="handleSave()" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label" for="displayName">Display Name</label>
              <input
                id="displayName"
                class="form-input"
                type="text"
                placeholder="Your name"
                [(ngModel)]="editDisplayName"
                name="displayName"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="emailDisplay">Email</label>
              <input
                id="emailDisplay"
                class="form-input"
                type="email"
                [value]="user?.email || ''"
                disabled
              />
              <span class="form-error" style="color:var(--text-tertiary);">Email cannot be changed</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="avatarUrl">Avatar URL</label>
              <input
                id="avatarUrl"
                class="form-input"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                [(ngModel)]="editAvatarUrl"
                name="avatarUrl"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Phone</label>
              <input
                id="phone"
                class="form-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                [(ngModel)]="editPhone"
                name="phone"
              />
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="loading" style="align-self:flex-start;min-width:140px;">
              <span *ngIf="loading" class="loading-spinner"></span>
              <span *ngIf="!loading">Save changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  editDisplayName = '';
  editAvatarUrl = '';
  editPhone = '';
  loading = false;
  error = '';
  success = '';
  private unsubscribe?: () => void;

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

  get joinDate(): string | null {
    if (!this.user?.createdAt) return null;
    return new Date(this.user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  ngOnInit() {
    this.user = this.authon.user;
    this.editDisplayName = this.user?.displayName ?? '';
    this.editAvatarUrl = this.user?.avatarUrl ?? '';
    this.editPhone = this.user?.phone ?? '';

    this.unsubscribe = this.authon.onStateChange(() => {
      this.user = this.authon.user;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }

  async handleSave() {
    this.loading = true;
    this.error = '';
    this.success = '';
    try {
      const client = this.authon.getClient();
      await client.updateProfile({
        displayName: this.editDisplayName || undefined,
        avatarUrl: this.editAvatarUrl || undefined,
        phone: this.editPhone || undefined,
      });
      this.success = 'Profile updated successfully';
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Failed to update profile';
    } finally {
      this.loading = false;
    }
  }
}
