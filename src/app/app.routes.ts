import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';
import { AdminRole } from './core/models';

export const routes: Routes = [
  // Public routes with layout
  {
    path: '',
    loadComponent: () => import('./layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
        title: 'E-Loan Must - Solusi Pinjaman Digital'
      }
    ]
  },
  
  // Auth routes (no layout)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard],
        title: 'Login - E-Loan Must Admin'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [guestGuard],
        title: 'Lupa Password - E-Loan Must Admin'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        canActivate: [guestGuard],
        title: 'Reset Password - E-Loan Must Admin'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  
  // Admin routes with layout
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - E-Loan Must Admin'
      },
      
      // Marketing - Review
      {
        path: 'review',
        loadComponent: () => import('./features/review/review-list.component').then(m => m.ReviewListComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN, AdminRole.MARKETING] },
        title: 'Review Pinjaman - E-Loan Must Admin'
      },
      
      // Branch Manager - Approval
      {
        path: 'approval',
        loadComponent: () => import('./features/approval/approval-list.component').then(m => m.ApprovalListComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN, AdminRole.BRANCH_MANAGER] },
        title: 'Approval Pinjaman - E-Loan Must Admin'
      },
      
      // Back Office - Disbursement
      {
        path: 'disbursement',
        loadComponent: () => import('./features/disbursement/disbursement-list.component').then(m => m.DisbursementListComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN, AdminRole.BACK_OFFICE] },
        title: 'Pencairan Dana - E-Loan Must Admin'
      },
      
      // Super Admin - User Management
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN] },
        title: 'Manajemen User - E-Loan Must Admin'
      },
      
      // Super Admin - Role Management
      {
        path: 'roles',
        loadComponent: () => import('./features/admin/role-management/role-management.component').then(m => m.RoleManagementComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN] },
        title: 'Role & Permission - E-Loan Must Admin'
      },
      
      // Super Admin - Product Management
      {
        path: 'products',
        loadComponent: () => import('./features/admin/product-management/product-management.component').then(m => m.ProductManagementComponent),
        canActivate: [roleGuard],
        data: { roles: [AdminRole.SUPER_ADMIN] },
        title: 'Manajemen Produk - E-Loan Must Admin'
      },
      
      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./features/notification/notification-list.component').then(m => m.NotificationListComponent),
        title: 'Notifikasi - E-Loan Must Admin'
      },

      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profile - E-Loan Must Admin'
      },
      
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // 404 Not Found
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Halaman Tidak Ditemukan'
  }
];
