import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  User,
  AuthResponse,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  AdminRole
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Reactive state using signals
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);

  // Public computed signals
  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly currentUser = computed(() => this._currentUser());
  readonly isLoading = computed(() => this._isLoading());

  // BehaviorSubject for legacy compatibility
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // Initialize auth state from stored token
  private initializeAuth(): void {
    if (this.tokenService.hasValidToken()) {
      const user = this.tokenService.getUser();
      if (user && this.tokenService.isAdmin()) {
        this._isAuthenticated.set(true);
        this._currentUser.set(user);
        this.userSubject.next(user);
      } else {
        // Clear invalid session (e.g., customer trying to access web)
        this.clearSession();
      }
    }
  }

  // Login for admin users only
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          const data = response.data as any;
          let user: User;
          let roleNames: string[] = [];

          // Logika adaptasi struktur response backend
          if (data.user) {
            // Format nested standard
            user = data.user;
            roleNames = user.roles?.map(r => r.name) || [];
          } else if (data.username) {
            // Format flat (backend saat ini)
            const rawRoles = data.roles || [];
            roleNames = Array.isArray(rawRoles) 
              ? rawRoles.map((r: any) => typeof r === 'string' ? r : r.name)
              : [];
            
            // Konstruksi User object manual
            user = {
              id: data.userId || data.id,
              username: data.username,
              email: data.email,
              firstName: data.firstName || data.username,
              lastName: data.lastName || '',
              roles: roleNames.map((r, i) => ({ id: i, name: r })),
              permissions: data.permissions || [],
              active: true
            };
          } else {
             console.error('Unknown login response structure:', data);
             throw new Error('Format data login tidak valid.');
          }

          // Validasi Role Admin
          const adminRoles = Object.values(AdminRole);
          const isAdminUser = roleNames.some(role => adminRoles.includes(role as AdminRole));

          if (!isAdminUser) {
            this._isLoading.set(false);
            throw new Error('Akses ditolak. Halaman ini hanya untuk admin internal.');
          }

          // Simpan token & user
          this.tokenService.setToken(data.accessToken);
          if (data.refreshToken) {
            this.tokenService.setRefreshToken(data.refreshToken);
          }
          this.tokenService.setUser(user);

          // Update state aplikasi
          this._isAuthenticated.set(true);
          this._currentUser.set(user);
          this.userSubject.next(user);
        }
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        
        // Handle specific error cases
        if (error.status === 403) {
          return throwError(() => new Error('Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.'));
        }
        if (error.status === 401) {
          return throwError(() => new Error('Username atau password salah.'));
        }
        
        return throwError(() => error);
      })
    );
  }

  // Logout
  logout(): Observable<ApiResponse<void>> {
    this._isLoading.set(true);
    
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this._isLoading.set(false);
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        // Clear session even if API call fails
        this.clearSession();
        this._isLoading.set(false);
        this.router.navigate(['/auth/login']);
        return of({ success: true, message: 'Logged out', data: undefined as void });
      })
    );
  }

  // Forgot password
  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<void>> {
    this._isLoading.set(true);
    
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, request).pipe(
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Reset password
  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<void>> {
    this._isLoading.set(true);
    
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, request).pipe(
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Refresh token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.setToken(response.data.accessToken);
          if (response.data.refreshToken) {
            this.tokenService.setRefreshToken(response.data.refreshToken);
          }
        }
      }),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  // Get current user from API
  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._currentUser.set(response.data);
          this.tokenService.setUser(response.data);
          this.userSubject.next(response.data);
        }
      })
    );
  }

  // Clear session
  private clearSession(): void {
    this.tokenService.clearStorage();
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.userSubject.next(null);
  }

  // Check if user has role
  hasRole(role: string): boolean {
    return this.tokenService.hasRole(role);
  }

  // Check if user has any of the roles
  hasAnyRole(roles: string[]): boolean {
    return this.tokenService.hasAnyRole(roles);
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    return this.tokenService.hasPermission(permission);
  }

  // Get user roles
  getUserRoles(): string[] {
    return this.tokenService.getUserRoles();
  }

  // Get primary role (first admin role)
  getPrimaryRole(): string | null {
    const roles = this.getUserRoles();
    const adminRoles = Object.values(AdminRole);
    return roles.find(role => adminRoles.includes(role as AdminRole)) || null;
  }
}
