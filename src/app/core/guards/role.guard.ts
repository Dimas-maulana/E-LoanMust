import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../auth/token.service';

// Guard to check if user has required role(s)
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    // No roles required, allow access
    return true;
  }

  // Check if user has any of the required roles
  if (!tokenService.hasAnyRole(requiredRoles)) {
    // User doesn't have required role, redirect to dashboard or access denied
    console.warn('Access denied: User does not have required roles', {
      required: requiredRoles,
      userRoles: tokenService.getUserRoles()
    });
    
    router.navigate(['/admin/dashboard'], {
      queryParams: { error: 'insufficient_permissions' }
    });
    return false;
  }

  return true;
};

// Guard to check if user has required permission(s)
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Get required permissions from route data
  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    // No permissions required, allow access
    return true;
  }

  // Check if user has all required permissions
  const userPermissions = tokenService.getUserPermissions();
  const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

  if (!hasAllPermissions) {
    console.warn('Access denied: User does not have required permissions', {
      required: requiredPermissions,
      userPermissions: userPermissions
    });
    
    router.navigate(['/admin/dashboard'], {
      queryParams: { error: 'insufficient_permissions' }
    });
    return false;
  }

  return true;
};
