import { Component, Input } from '@angular/core'
import { describeAuthonError, type AuthonErrorInfo } from './authon-errors'

@Component({
  selector: 'app-error-alert',
  standalone: true,
  template: `
    @if (info) {
      <div class="alert alert-error" role="alert">
        <span class="alert-code">{{ info.code }}</span>{{ info.message }}
        @if (info.hint) {
          <span class="alert-hint">{{ info.hint }}</span>
        }
      </div>
    }
  `,
})
export class ErrorAlertComponent {
  info: AuthonErrorInfo | null = null

  @Input() set error(value: unknown) {
    this.info = value ? describeAuthonError(value) : null
  }
}
