// User model
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  permissions?: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Role model
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

// Permission model
export interface Permission {
  id: number;
  name: string;
  description?: string;
}

// Admin Roles - Users allowed to login to web
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MARKETING = 'MARKETING',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  BACK_OFFICE = 'BACK_OFFICE'
}

// Customer Role - NOT allowed to login to web
export enum CustomerRole {
  USER = 'USER'
}

// All system roles
export type SystemRole = AdminRole | CustomerRole;

// JWT Payload structure
export interface JwtPayload {
  sub: string;
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions?: string[];
  iat: number;
  exp: number;
}

// Auth response from backend
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  };
}

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  errors?: string[];
}

// Pagination
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
