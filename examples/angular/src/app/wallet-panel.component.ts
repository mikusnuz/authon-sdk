import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AuthonService } from '@authon/angular'
import type { EmbeddedWallet } from '@authon/js'
import { ErrorAlertComponent } from './error-alert.component'

type Action = 'load' | 'sign' | 'protect' | 'restore' | null

@Component({
  selector: 'app-wallet-panel',
  standalone: true,
  imports: [FormsModule, ErrorAlertComponent],
  template: `
    <div class="panel">
      <div class="panel-title">Wallet</div>
      <p class="panel-desc">An embedded EVM wallet created for this account. The project must have wallets turned on.</p>

      @if (busy === 'load' && !wallet) {
        <p class="panel-desc">Loading wallet...</p>
      }

      @if (wallet) {
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value mono" [title]="wallet.address">{{ wallet.address }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Passkey backup</span>
            <span class="info-badge" [class.badge-green]="wallet.protected" [class.badge-yellow]="!wallet.protected">
              {{ wallet.protected ? 'Protected' : 'Not protected' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">This browser</span>
            <span class="info-badge" [class.badge-yellow]="wallet.needsRestore" [class.badge-green]="!wallet.needsRestore">
              {{ wallet.needsRestore ? 'Needs restore' : 'Ready' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Devices</span>
            <span class="info-value">{{ wallet.devices.length }}</span>
          </div>
        </div>

        @if (wallet.needsRestore) {
          <div class="field-row">
            <button class="btn btn-primary btn-sm" [disabled]="busy !== null" (click)="restore(false)">
              {{ busy === 'restore' ? 'Restoring...' : 'Restore wallet' }}
            </button>
            <button class="btn btn-outline btn-sm" [disabled]="busy !== null" (click)="restore(true)">
              Restore and reset other devices
            </button>
          </div>
        }

        @if (!wallet.protected && !wallet.needsRestore) {
          <button class="btn btn-primary btn-sm" [disabled]="busy !== null" (click)="protect()">
            {{ busy === 'protect' ? 'Protecting...' : 'Protect wallet' }}
          </button>
        }

        <div class="field-row">
          <input [(ngModel)]="message" class="field" />
          <button class="btn btn-outline btn-sm" [disabled]="busy !== null || !message" (click)="sign()">
            {{ busy === 'sign' ? 'Signing...' : 'Sign message' }}
          </button>
        </div>
        @if (signature) {
          <div class="output">{{ signature }}</div>
        }
      }

      <app-error-alert [error]="error" />
      @if (!wallet && error !== null && busy === null) {
        <button class="btn btn-outline btn-sm" (click)="load()">Try again</button>
      }
    </div>
  `,
})
export class WalletPanelComponent implements OnInit, OnDestroy {
  // AuthonService has no wallet methods, so the panel uses the core client: getClient().wallet.
  private client = inject<AuthonService>('AuthonService' as never).getClient()
  private cdr = inject(ChangeDetectorRef)
  private cleanups: Array<() => void> = []

  wallet: EmbeddedWallet | null = null
  message = 'Hello from Authon'
  signature: string | null = null
  busy: Action = null
  error: unknown = null

  ngOnInit(): void {
    this.cleanups.push(this.client.on('walletChanged', (next) => {
      this.wallet = next
      this.cdr.detectChanges()
    }))
    this.cleanups.push(this.client.on('walletError', (err) => {
      this.error = err
      this.cdr.detectChanges()
    }))
    this.load()
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((off) => off())
  }

  private async run(action: Action, fn: () => Promise<void>): Promise<void> {
    this.busy = action
    this.error = null
    try {
      await fn()
    } catch (err) {
      this.error = err
    } finally {
      this.busy = null
      this.cdr.detectChanges()
    }
  }

  load(): void {
    // ensure() returns the wallet, creating it on first use (autoCreate also does this after sign-in).
    void this.run('load', async () => {
      this.wallet = await this.client.wallet.ensure()
    })
  }

  sign(): void {
    void this.run('sign', async () => {
      this.signature = null
      this.signature = await this.client.wallet.signMessage(this.message)
    })
  }

  // protect() and restore() open a passkey prompt, so they must run straight from a click.
  protect(): void {
    void this.run('protect', async () => {
      await this.client.wallet.protect()
      this.wallet = await this.client.wallet.get()
    })
  }

  restore(resetOtherDevices: boolean): void {
    void this.run('restore', async () => {
      await this.client.wallet.restore({ resetOtherDevices })
      this.wallet = await this.client.wallet.get()
    })
  }
}
