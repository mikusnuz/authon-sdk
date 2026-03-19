import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuthon } from '@authon/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...provideAuthon({
      publishableKey: 'your-project-id',
      config: { apiUrl: 'https://api.authon.dev' },
    }),
  ],
};
