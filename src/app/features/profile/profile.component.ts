import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../core/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">Profile Saya</h1>
        <p class="text-gray-400">Informasi akun dan pengaturan</p>
      </div>

      <!-- Profile Card -->
      <div class="glass-card">
        <div class="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
          <!-- Avatar -->
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span class="text-4xl font-bold text-white">{{ userInitials() }}</span>
          </div>
          
          <!-- User Info -->
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-1">{{ userName() }}</h2>
            <p class="text-gray-400 mb-2">{{ userEmail() }}</p>
            <span class="badge badge-blue">{{ userRole() }}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-4">Informasi Akun</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Username</p>
                <p class="text-white font-medium">{{ username() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Email</p>
                <p class="text-white font-medium">{{ userEmail() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Role</p>
                <p class="text-white font-medium">{{ userRole() }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-4">Informasi Tambahan</h3>
            <div class="space-y-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                <p class="text-white font-medium">{{ userName() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Status Akun</p>
                <span class="badge badge-green">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="glass-card">
        <h3 class="text-lg font-bold text-white mb-4">Pengaturan</h3>
        <div class="space-y-3">
          <button class="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔒</span>
              <div>
                <p class="text-white font-medium">Ubah Password</p>
                <p class="text-sm text-gray-400">Update password akun Anda</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button class="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔔</span>
              <div>
                <p class="text-white font-medium">Notifikasi</p>
                <p class="text-sm text-gray-400">Atur preferensi notifikasi</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private tokenService = inject(TokenService);

  userName = computed(() => {
    const user = this.tokenService.getUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return this.tokenService.getUsername() || 'Admin User';
  });

  userEmail = computed(() => {
    const user = this.tokenService.getUser();
    return user?.email || 'admin@eloanmust.com';
  });

  username = computed(() => {
    return this.tokenService.getUsername() || 'admin';
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
      'SUPER_ADMIN': 'Super Admin',
      'MARKETING': 'Marketing',
      'BRANCH_MANAGER': 'Branch Manager',
      'BACK_OFFICE': 'Back Office'
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
    // Component initialization
  }
}
