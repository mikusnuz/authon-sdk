import { AuthonService, AUTHON_CONFIG, type AuthonServiceConfig } from './service';

/**
 * Provider factory for Angular standalone components.
 *
 * Usage in app.config.ts:
 * ```ts
 * import { provideAuthon } from '@authon/angular';
 *
 * export const appConfig = {
 *   providers: [
 *     ...provideAuthon({ publishableKey: 'pk_live_...' }),
 *   ],
 * };
 * ```
 *
 * Then inject in your components:
 * ```ts
 * import { Inject } from '@angular/core';
 * import { AUTHON_CONFIG, AuthonService } from '@authon/angular';
 *
 * constructor(@Inject('AuthonService') private authon: AuthonService) {}
 * ```
 */
export function provideAuthon(config: AuthonServiceConfig) {
  const service = new AuthonService(config);

  return [
    { provide: AUTHON_CONFIG, useValue: config },
    { provide: 'AuthonService', useValue: service },
  ];
}
