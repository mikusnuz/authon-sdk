import { ApplicationConfig } from '@angular/core'
import { provideAuthon } from '@authon/angular'
import { environment } from '../environments/environment'

const publishableKey = environment.authonPublishableKey || ''
const apiUrl = environment.authonApiUrl || undefined

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideAuthon({
      publishableKey: publishableKey,
      config: {
        ...(apiUrl ? { apiUrl } : {}),
        // Create the embedded wallet in the background after sign-in (needs wallets turned on for the project).
        wallet: { autoCreate: true },
      },
    }),
  ],
}
