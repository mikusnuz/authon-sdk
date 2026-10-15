import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { AuthonService } from '@authon/angular'
import type { PasskeyCredential } from '@authon/shared'
import { ErrorAlertComponent } from './error-alert.component'

@Component({
  selector: 'app-passkey-panel',
  standalone: true,
  imports: [ErrorAlertComponent],
  template: `
    <div class="panel">
      <div class="panel-title">Passkeys</div>
      <p class="panel-desc">Add a passkey so you can sign in next time with Face ID, Touch ID or a security key.</p>
      <button class="btn btn-primary btn-sm" [disabled]="busy" (click)="register()">
        {{ busy ? 'Waiting for passkey...' : 'Register passkey' }}
      </button>
      @if (registered) {
        <div class="alert alert-success">Passkey registered: {{ registered.name || registered.id }}</div>
      }
      <app-error-alert [error]="error" />
    </div>
  `,
})
export class PasskeyPanelComponent {
  private authon = inject<AuthonService>('AuthonService' as never)
  private cdr = inject(ChangeDetectorRef)

  busy = false
  error: unknown = null
  registered: PasskeyCredential | null = null

  async register(): Promise<void> {
    this.busy = true
    this.error = null
    try {
      this.registered = await this.authon.passkeyRegister()
    } catch (err) {
      this.error = err
    } finally {
      this.busy = false
      this.cdr.detectChanges()
    }
  }
}
