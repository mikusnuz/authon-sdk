import { AuthupService, AUTHUP_CONFIG, type AuthupServiceConfig } from './service';

/**
 * Provider factory for Angular standalone components.
 *
 * Usage in app.config.ts:
 * ```ts
 * import { provideAuthup } from '@authup/angular';
 *
 * export const appConfig = {
 *   providers: [
 *     ...provideAuthup({ publishableKey: 'pk_live_...' }),
 *   ],
 * };
 * ```
 *
 * Then inject in your components:
 * ```ts
 * import { Inject } from '@angular/core';
 * import { AUTHUP_CONFIG, AuthupService } from '@authup/angular';
 *
 * constructor(@Inject('AuthupService') private authup: AuthupService) {}
 * ```
 */
export function provideAuthup(config: AuthupServiceConfig) {
  const service = new AuthupService(config);

  return [
    { provide: AUTHUP_CONFIG, useValue: config },
    { provide: 'AuthupService', useValue: service },
  ];
}
