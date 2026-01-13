import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../auth/token.service';

// Guard to protect admin routes - requires authentication
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Check if user has valid token
  if (!tokenService.hasValidToken()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if user is admin (not a customer)
  if (!tokenService.isAdmin()) {
    // Customer/USER role trying to access web - reject
    tokenService.clearStorage();
    router.navigate(['/auth/login'], {
      queryParams: { error: 'access_denied' }
    });
    return false;
  }

  return true;
};

// Guard to prevent authenticated users from accessing login page
export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.hasValidToken() && tokenService.isAdmin()) {
    // Already logged in, redirect to dashboard
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};
