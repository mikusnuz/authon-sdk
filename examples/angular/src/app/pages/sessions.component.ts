import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthonService } from '@authon/angular';

interface SessionInfo {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  createdAt?: string;
  isCurrent?: boolean;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseUserAgent(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return 'Unknown browser';
}

function getDeviceIcon(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return '📱';
  if (lower.includes('tablet') || lower.includes('ipad')) return '📟';
  return '💻';
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" style="max-width:720px;">
      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);">Active Sessions</h1>
          <button class="btn btn-secondary btn-sm" (click)="load()" [disabled]="fetching">Refresh</button>
        </div>
        <p style="color:var(--text-secondary);font-size:14px;">
          Manage your active sessions using
          <code style="color:var(--accent);">client.listSessions()</code>,
          <code style="color:var(--accent);">client.revokeSession(id)</code>
        </p>
      </div>

      <ng-container *ngIf="fetching">
        <div style="display:flex;justify-content:center;padding:60px 0;">
          <div class="loading-spinner-lg"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!fetching">
        <div class="alert alert-error" style="margin-bottom:16px;" *ngIf="error">{{ error }}</div>
        <div class="alert alert-success" style="margin-bottom:16px;" *ngIf="successMsg">{{ successMsg }}</div>

        <div class="card" style="margin-bottom:16px;padding:12px 16px;">
          <span style="font-size:13px;color:var(--text-secondary);">
            {{ sessions.length }} active {{ sessions.length === 1 ? 'session' : 'sessions' }}
          </span>
        </div>

        <ng-container *ngIf="sessions.length === 0">
          <div class="card" style="text-align:center;padding:40px 20px;">
            <div style="font-size:40px;margin-bottom:12px;">📭</div>
            <div style="color:var(--text-secondary);font-size:15px;">No active sessions found</div>
          </div>
        </ng-container>

        <div *ngIf="sessions.length > 0" style="display:flex;flex-direction:column;gap:10px;">
          <div *ngFor="let session of sessions; let i = index" class="session-item">
            <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
              <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;"
                [style.background]="i === 0 ? 'var(--accent-light)' : 'rgba(100,116,139,0.1)'">
                {{ getDeviceIcon(session.userAgent || '') }}
              </div>
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                  <span style="font-weight:600;font-size:14px;color:var(--text-primary);">
                    {{ parseBrowser(session.userAgent || '') }}
                  </span>
                  <span *ngIf="i === 0" class="badge badge-success" style="font-size:11px;">Current</span>
                </div>
                <div style="font-size:12px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                  {{ truncateUa(session.userAgent || '') }}
                </div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;display:flex;gap:12px;">
                  <span *ngIf="session.ipAddress">IP: {{ session.ipAddress }}</span>
                  <span *ngIf="session.lastActiveAt">Active {{ formatRelative(session.lastActiveAt) }}</span>
                  <span *ngIf="session.createdAt">Signed in {{ formatDate(session.createdAt) }}</span>
                </div>
              </div>
            </div>
            <button
              *ngIf="i !== 0"
              class="btn btn-danger btn-sm"
              (click)="handleRevoke(session.id)"
              [disabled]="revoking === session.id"
              style="flex-shrink:0;"
            >
              <span *ngIf="revoking === session.id" class="loading-spinner" style="width:14px;height:14px;"></span>
              <span *ngIf="revoking !== session.id">Revoke</span>
            </button>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="section-title">Security Tip</div>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">
            If you notice any suspicious sessions, revoke them immediately and change your password.
            Sessions are automatically cleared after 30 days of inactivity.
          </p>
        </div>
      </ng-container>
    </div>
  `,
})
export class SessionsComponent implements OnInit {
  sessions: SessionInfo[] = [];
  fetching = true;
  revoking: string | null = null;
  error = '';
  successMsg = '';

  constructor(
    @Inject('AuthonService') private authon: AuthonService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.fetching = true;
    this.error = '';
    try {
      const client = this.authon.getClient();
      const data = await client.listSessions();
      this.sessions = data || [];
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Failed to load sessions';
    } finally {
      this.fetching = false;
      this.cdr.detectChanges();
    }
  }

  async handleRevoke(sessionId: string) {
    this.revoking = sessionId;
    this.successMsg = '';
    try {
      const client = this.authon.getClient();
      await client.revokeSession(sessionId);
      this.sessions = this.sessions.filter((s) => s.id !== sessionId);
      this.successMsg = 'Session revoked successfully.';
    } catch (err: any) {
      this.error = err instanceof Error ? err.message : 'Failed to revoke session';
    } finally {
      this.revoking = null;
      this.cdr.detectChanges();
    }
  }

  parseBrowser(ua: string): string {
    return parseUserAgent(ua);
  }

  getDeviceIcon(ua: string): string {
    return getDeviceIcon(ua);
  }

  truncateUa(ua: string): string {
    return ua.length > 60 ? ua.slice(0, 60) + '...' : ua || 'Unknown user agent';
  }

  formatRelative(dateStr: string): string {
    return formatRelative(dateStr);
  }

  formatDate(dateStr: string): string {
    return formatDate(dateStr);
  }
}
