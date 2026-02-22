import type { AuthonService } from './service';

/**
 * Route guard factory for Angular Router (CanActivateFn style).
 *
 * Since tsup can't compile Angular decorators, this returns a plain function.
 * Users wire it up in their route config:
 *
 * ```ts
 * import { inject } from '@angular/core';
 * import { authGuard } from '@authon/angular';
 * import { AuthonService } from './authon.service'; // your injectable wrapper
 *
 * const routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [() => {
 *       const authon = inject(AuthonService);
 *       return authGuard(authon, '/login');
 *     }],
 *   },
 * ];
 * ```
 */
export function authGuard(
  authonService: AuthonService,
  redirectTo = '/sign-in',
): boolean | { path: string } {
  if (authonService.isLoading) {
    return false;
  }

  if (!authonService.isSignedIn) {
    return { path: redirectTo };
  }

  return true;
}
