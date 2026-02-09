import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

/**
 * Security Interceptor - OWASP Security Headers & Request Validation
 * 
 * Implements:
 * - Request body sanitization (XSS Prevention - A03:2021)
 * - Security headers injection
 * - Response content validation
 */
export const securityInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const securityService = inject(SecurityService);

  // Clone request with security headers
  let secureReq = req.clone({
    setHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection for some backends
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });

  // Sanitize request body if present (for POST, PUT, PATCH requests)
  if (req.body && typeof req.body === 'object' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // Check for potential XSS in request body
    const bodyString = JSON.stringify(req.body);
    
    if (securityService.containsXSS(bodyString)) {
      console.warn('Security Warning: Potential XSS detected in request body', {
        url: req.url,
        method: req.method
      });
      
      // Sanitize the body
      const sanitizedBody = securityService.sanitizeObject(req.body as object);
      secureReq = secureReq.clone({ body: sanitizedBody });
    }

    // Check for SQL injection patterns (log warning only)
    if (securityService.containsSQLInjection(bodyString)) {
      console.warn('Security Warning: Potential SQL injection pattern detected', {
        url: req.url,
        method: req.method
      });
    }
  }

  // Validate URL to prevent SSRF
  if (req.url.includes('..') || req.url.includes('%2e%2e')) {
    console.error('Security Error: Path traversal attempt detected', { url: req.url });
    return throwError(() => new Error('Invalid URL detected'));
  }

  return next(secureReq).pipe(
    map((event: HttpEvent<unknown>) => {
      // Validate response content type
      if (event instanceof HttpResponse) {
        const contentType = event.headers.get('Content-Type');
        
        // Ensure response is expected JSON for API calls
        if (req.url.includes('/api/') && contentType && !contentType.includes('application/json')) {
          console.warn('Security Warning: Unexpected content type in API response', {
            url: req.url,
            contentType
          });
        }
      }
      
      return event;
    }),
    catchError(error => {
      // Log security-related errors
      if (error.status === 401 || error.status === 403) {
        console.warn('Security: Authentication/Authorization error', {
          url: req.url,
          status: error.status
        });
      }
      
      return throwError(() => error);
    })
  );
};
