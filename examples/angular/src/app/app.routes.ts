import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard, AuthonService } from '@authon/angular';
import { HomeComponent } from './pages/home.component';
import { SignInComponent } from './pages/sign-in.component';
import { SignUpComponent } from './pages/sign-up.component';
import { ResetPasswordComponent } from './pages/reset-password.component';
import { ProfileComponent } from './pages/profile.component';
import { MfaComponent } from './pages/mfa.component';
import { SessionsComponent } from './pages/sessions.component';
import { DeleteAccountComponent } from './pages/delete-account.component';

function authGuardFn() {
  const authon = inject<AuthonService>('AuthonService' as any);
  const router = inject(Router);
  if (!authon) return router.createUrlTree(['/sign-in']);
  const result = authGuard(authon, '/sign-in');
  if (typeof result === 'object' && 'path' in result) {
    return router.createUrlTree([result.path]);
  }
  return result;
}

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuardFn] },
  { path: 'mfa', component: MfaComponent, canActivate: [authGuardFn] },
  { path: 'sessions', component: SessionsComponent, canActivate: [authGuardFn] },
  { path: 'delete-account', component: DeleteAccountComponent, canActivate: [authGuardFn] },
  { path: '**', redirectTo: '' },
];
