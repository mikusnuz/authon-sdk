import { ApplicationConfig } from '@angular/core'
import { provideAuthon } from '@authon/angular'
import { environment } from '../environments/environment'

const publishableKey = environment.authonProjectId || ''
const apiUrl = environment.authonApiUrl || undefined

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideAuthon({
      publishableKey: publishableKey,
      config: apiUrl ? { apiUrl } : undefined,
    }),
  ],
}
