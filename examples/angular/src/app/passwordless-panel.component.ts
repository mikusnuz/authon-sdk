import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AuthonService } from '@authon/angular'
import { ErrorAlertComponent } from './error-alert.component'

@Component({
  selector: 'app-passwordless-panel',
  standalone: true,
  imports: [FormsModule, ErrorAlertComponent],
  template: `
    <div class="panel">
      <div class="panel-title">Sign in without a password</div>
      <p class="panel-desc">Get a one-time code or a magic link by email, or use a passkey saved on this device.</p>

      @if (step === 'email') {
        <input [(ngModel)]="email" class="field" type="email" placeholder="you@example.com" />
        <div class="field-row">
          <button class="btn btn-primary btn-sm" [disabled]="busy || !email" (click)="sendCode()">Email me a code</button>
          <button class="btn btn-outline btn-sm" [disabled]="busy || !email" (click)="sendLink()">Send magic link</button>
        </div>
      } @else if (step === 'code') {
        <p class="panel-desc">Enter the code sent to {{ email }}.</p>
        <div class="field-row">
          <input [(ngModel)]="code" class="field" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" />
          <button class="btn btn-primary btn-sm" [disabled]="busy || !code" (click)="verifyCode()">Verify code</button>
        </div>
        <button class="btn-link" (click)="reset()">Use a different email</button>
      } @else {
        <div class="alert alert-success">Magic link sent to {{ email }}. Open it in this browser to finish signing in.</div>
        <button class="btn-link" (click)="reset()">Use a different email</button>
      }

      <div class="panel-divider"><span>or</span></div>
      <button class="btn btn-outline btn-sm" [disabled]="busy" (click)="signInWithPasskey()">Sign in with passkey</button>

      <app-error-alert [error]="error" />
    </div>
  `,
})
export class PasswordlessPanelComponent {
  private authon = inject<AuthonService>('AuthonService' as never)
  private cdr = inject(ChangeDetectorRef)

  email = ''
  code = ''
  step: 'email' | 'code' | 'link-sent' = 'email'
  busy = false
  error: unknown = null

  private async run(fn: () => Promise<unknown>): Promise<boolean> {
    this.busy = true
    this.error = null
    try {
      await fn()
      return true
    } catch (err) {
      this.error = err
      return false
    } finally {
      this.busy = false
      this.cdr.detectChanges()
    }
  }

  async sendCode(): Promise<void> {
    if (await this.run(() => this.authon.passwordlessSendCode(this.email, 'otp'))) this.step = 'code'
  }

  async sendLink(): Promise<void> {
    // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
    if (await this.run(() => this.authon.passwordlessSendCode(this.email, 'magic-link'))) this.step = 'link-sent'
  }

  async verifyCode(): Promise<void> {
    await this.run(() => this.authon.passwordlessVerifyCode(this.email, this.code.trim()))
  }

  async signInWithPasskey(): Promise<void> {
    await this.run(() => this.authon.passkeyAuthenticate(this.email || undefined))
  }

  reset(): void {
    this.step = 'email'
    this.code = ''
  }
}
