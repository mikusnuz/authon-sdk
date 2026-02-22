import type { AuthupService } from './service';

/**
 * Route guard factory for Angular Router (CanActivateFn style).
 *
 * Since tsup can't compile Angular decorators, this returns a plain function.
 * Users wire it up in their route config:
 *
 * ```ts
 * import { inject } from '@angular/core';
 * import { authGuard } from '@authup/angular';
 * import { AuthupService } from './authup.service'; // your injectable wrapper
 *
 * const routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [() => {
 *       const authup = inject(AuthupService);
 *       return authGuard(authup, '/login');
 *     }],
 *   },
 * ];
 * ```
 */
export function authGuard(
  authupService: AuthupService,
  redirectTo = '/sign-in',
): boolean | { path: string } {
  if (authupService.isLoading) {
    return false;
  }

  if (!authupService.isSignedIn) {
    return { path: redirectTo };
  }

  return true;
}
