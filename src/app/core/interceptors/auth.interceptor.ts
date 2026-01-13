import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../auth/token.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Get the token
  const token = tokenService.getToken();

  // Clone request with auth header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - Token expired or invalid
      if (error.status === 401) {
        tokenService.clearStorage();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url, reason: 'session_expired' }
        });
      }

      // Handle 403 Forbidden - Access denied
      if (error.status === 403) {
        // Could redirect to access denied page
        console.error('Access denied:', error.message);
      }

      return throwError(() => error);
    })
  );
};
