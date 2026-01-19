import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, TokenService } from '../../core/auth';
import { NotificationService } from '../../shared/services';
import { AdminRole } from '../../core/models';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex">
      <!-- Sidebar -->
      <aside 
        class="fixed left-0 top-0 bottom-0 w-64 glass-panel border-r border-white/10 flex flex-col z-40 transition-transform duration-300"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <!-- Logo -->
        <div class="p-6 border-b border-white/10">
          <a routerLink="/admin/dashboard" class="flex items-center gap-3">
            <img src="images/logo.png" alt="Logo" class="w-10 h-10 object-contain shadow-blue">
            <div class="flex items-baseline">
              <span class="text-lg font-bold text-blue-400">E-Loan</span>
              <span class="text-lg font-bold text-amber-400 ml-1">Must</span>
            </div>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 overflow-y-auto">
          <ul class="space-y-1">
            @for (item of visibleMenuItems(); track item.route) {
              <li>
                <a 
                  [routerLink]="item.route"
                  routerLinkActive="bg-blue-600/20 text-blue-400 border-blue-500/30"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all border border-transparent"
                >
                  <span class="text-xl">{{ item.icon }}</span>
                  <span class="font-medium">{{ item.label }}</span>
                  @if (item.badge && item.badge > 0) {
                    <span class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {{ item.badge }}
                    </span>
                  }
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-white/10">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate">{{ userName() }}</p>
              <p class="text-xs text-gray-400 truncate">{{ userRole() }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        <!-- Top Bar -->
        <header class="sticky top-0 z-30 glass-panel border-b border-white/10">
          <div class="flex items-center justify-between px-6 py-4">
            <!-- Mobile Menu Toggle -->
            <button 
              class="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
              (click)="toggleSidebar()"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Page Title -->
            <h1 class="text-xl font-bold text-white hidden lg:block">{{ pageTitle() }}</h1>

            <!-- Right Actions -->
            <div class="flex items-center gap-4">
              <!-- Notifications -->
              <div class="relative">
                <button 
                  class="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all relative"
                  (click)="toggleNotifications()"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  @if (unreadCount() > 0) {
                    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                    </span>
                  }
                </button>

                <!-- Notification Dropdown -->
                @if (notificationOpen()) {
                  <div class="absolute right-0 mt-2 w-80 glass-card p-0 overflow-hidden">
                    <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <h3 class="font-semibold text-white">Notifikasi</h3>
                      <button class="text-sm text-blue-400 hover:text-blue-300">Tandai semua dibaca</button>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                      @if (notifications().length === 0) {
                        <div class="p-6 text-center text-gray-400">
                          Tidak ada notifikasi
                        </div>
                      } @else {
                        @for (notif of notifications(); track notif.id) {
                          <div class="px-4 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer">
                            <p class="text-sm text-white">{{ notif.title }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ notif.message }}</p>
                          </div>
                        }
                      }
                    </div>
                    <a routerLink="/admin/notifications" class="block px-4 py-3 text-center text-sm text-blue-400 hover:text-blue-300 border-t border-white/10">
                      Lihat semua
                    </a>
                  </div>
                }
              </div>

              <!-- User Menu -->
              <div class="relative">
                <button 
                  class="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  (click)="toggleUserMenu()"
                >
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {{ userInitials() }}
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 glass-card p-2">
                    <a 
                      routerLink="/admin/profile" 
                      class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                      (click)="userMenuOpen.set(false)"
                    >
                      <span>👤</span>
                      <span>Profil</span>
                    </a>
                    <button 
                      class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                      (click)="logout()"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div 
          class="fixed inset-0 bg-black/50 z-30 lg:hidden"
          (click)="closeSidebar()"
        ></div>
      }
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // State
  sidebarOpen = signal(true);
  notificationOpen = signal(false);
  userMenuOpen = signal(false);
  unreadCount = signal(0);
  notifications = signal<any[]>([]);
  pageTitle = signal('Dashboard');

  // Menu items with role-based access
  private menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/admin/dashboard',
      roles: [AdminRole.SUPER_ADMIN, AdminRole.MARKETING, AdminRole.BRANCH_MANAGER, AdminRole.BACK_OFFICE]
    },
    {
      label: 'Review Pinjaman',
      icon: '📋',
      route: '/admin/review',
      roles: [AdminRole.MARKETING]
    },
    {
      label: 'Approval Pinjaman',
      icon: '✅',
      route: '/admin/approval',
      roles: [AdminRole.BRANCH_MANAGER]
    },
    {
      label: 'Disbursement',
      icon: '💰',
      route: '/admin/disbursement',
      roles: [AdminRole.BACK_OFFICE]
    },
    {
      label: 'Manajemen User',
      icon: '👥',
      route: '/admin/users',
      roles: [AdminRole.SUPER_ADMIN]
    },
    {
      label: 'Role & Permission',
      icon: '🔐',
      route: '/admin/roles',
      roles: [AdminRole.SUPER_ADMIN]
    },
    {
      label: 'Produk / Plafond',
      icon: '📦',
      route: '/admin/products',
      roles: [AdminRole.SUPER_ADMIN]
    },
    {
      label: 'Notifikasi',
      icon: '🔔',
      route: '/admin/notifications',
      roles: [AdminRole.SUPER_ADMIN, AdminRole.MARKETING, AdminRole.BRANCH_MANAGER, AdminRole.BACK_OFFICE]
    }
  ];

  // Computed visible menu items based on user roles
  visibleMenuItems = computed(() => {
    const userRoles = this.tokenService.getUserRoles();
    return this.menuItems.filter(item => 
      item.roles.some(role => userRoles.includes(role))
    );
  });

  // User info
  userName = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    return this.tokenService.getUsername() || 'Admin';
  });

  userInitials = computed(() => {
    const name = this.userName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  userRole = computed(() => {
    const roleMap: Record<string, string> = {
      [AdminRole.SUPER_ADMIN]: 'Super Admin',
      [AdminRole.MARKETING]: 'Marketing',
      [AdminRole.BRANCH_MANAGER]: 'Branch Manager',
      [AdminRole.BACK_OFFICE]: 'Back Office'
    };
    
    const roles = this.tokenService.getUserRoles();
    for (const role of roles) {
      if (roleMap[role]) {
        return roleMap[role];
      }
    }
    return 'Admin';
  });

  ngOnInit(): void {
    // Check screen size on init
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    // Load notification count
    this.loadNotificationCount();
  }

  private checkScreenSize(): void {
    this.sidebarOpen.set(window.innerWidth >= 1024);
  }

  private loadNotificationCount(): void {
    this.notificationService.getNotificationCount().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.unreadCount.set(response.data.unread);
        }
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  toggleNotifications(): void {
    this.notificationOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
    this.notificationOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
