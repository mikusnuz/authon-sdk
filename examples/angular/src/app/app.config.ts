import { ApplicationConfig } from '@angular/core'
import { provideAuthon } from '@authon/angular'
import { environment } from '../environments/environment'

const publishableKey = environment.authonPublishableKey || ''
const apiUrl = environment.authonApiUrl || undefined

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideAuthon({
      publishableKey: publishableKey,
      config: apiUrl ? { apiUrl } : undefined,
    }),
  ],
}
