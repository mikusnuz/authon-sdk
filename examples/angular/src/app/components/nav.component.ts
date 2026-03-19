import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthonService } from '@authon/angular';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav style="height:64px;background:rgba(10,15,30,0.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;padding:0 24px;position:sticky;top:0;z-index:100;">
      <div style="max-width:1100px;margin:0 auto;width:100%;display:flex;align-items:center;justify-content:space-between;">
        <a routerLink="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;">
            A
          </div>
          <span style="font-weight:700;font-size:16px;color:var(--text-primary);">
            Authon
            <span style="color:var(--accent);margin-left:4px;font-size:13px;font-weight:500;">Angular SDK</span>
          </span>
        </a>

        <div style="display:flex;align-items:center;gap:8px;">
          <ng-container *ngIf="isSignedIn">
            <a routerLink="/profile" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:color 0.15s;">
              Profile
            </a>
            <a routerLink="/mfa" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:color 0.15s;">
              MFA
            </a>
            <a routerLink="/sessions" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:color 0.15s;">
              Sessions
            </a>
            <button
              class="btn btn-secondary btn-sm"
              (click)="signOut()"
              style="display:flex;align-items:center;gap:6px;"
            >
              <span *ngIf="user?.avatarUrl">
                <img [src]="user!.avatarUrl" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" [alt]="user?.displayName || 'avatar'" />
              </span>
              <span *ngIf="!user?.avatarUrl">{{ initials }}</span>
              <span>Sign out</span>
            </button>
          </ng-container>
          <ng-container *ngIf="!isSignedIn">
            <a routerLink="/sign-in" style="padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:var(--text-secondary);text-decoration:none;border:1px solid var(--border);transition:all 0.15s;">
              Sign in
            </a>
            <a routerLink="/sign-up" style="padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;text-decoration:none;background:var(--accent);transition:background 0.15s;">
              Sign up
            </a>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
})
export class NavComponent implements OnInit, OnDestroy {
  isSignedIn = false;
  user: any = null;
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

  async signOut() {
    await this.authon.signOut();
  }
}
