import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { JwtPayload, User, AdminRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.refreshTokenKey;
  private readonly USER_KEY = environment.userKey;

  constructor() {}

  // Store access token
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get access token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove access token
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Store refresh token
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Remove refresh token
  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Store user data
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get user data
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Remove user data
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Clear all stored data
  clearStorage(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // Decode JWT token
  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  // Get token expiration date
  getTokenExpirationDate(): Date | null {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  }

  // Check if user has valid token
  hasValidToken(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  // Get user roles from token or stored user
  getUserRoles(): string[] {
    const decoded = this.decodeToken();
    if (decoded?.roles && decoded.roles.length > 0) {
      return decoded.roles;
    }
    
    // Fallback: Get from stored user data
    const user = this.getUser();
    return user?.roles?.map(r => r.name) || [];
  }

  // Get user permissions from token or stored user
  getUserPermissions(): string[] {
    const decoded = this.decodeToken();
    if (decoded?.permissions && decoded.permissions.length > 0) {
      return decoded.permissions;
    }

    // Fallback: Get from stored user data
    const user = this.getUser();
    return user?.permissions || [];
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  // Check if user has all of the specified roles
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every(role => userRoles.includes(role));
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  // Check if user is admin (can login to web)
  isAdmin(): boolean {
    const adminRoles = Object.values(AdminRole);
    return this.hasAnyRole(adminRoles);
  }

  // Check if user is a customer (USER role - cannot login to web)
  isCustomer(): boolean {
    return this.hasRole('USER') && !this.isAdmin();
  }

  // Get username from token
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.username || null;
  }

  // Get user ID from token
  getUserId(): number | null {
    const decoded = this.decodeToken();
    return decoded?.userId || null;
  }
}
