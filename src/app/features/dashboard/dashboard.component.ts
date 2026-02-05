import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LoanService } from '../../shared/services';
import { TokenService } from '../../core/auth';
import { LoanStatistics, AdminRole } from '../../core/models';
import { CurrencyPipe } from '../../shared/pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
            Selamat Datang, {{ userName() }}! 👋
          </h1>
          <p class="text-gray-400">
            Berikut adalah ringkasan aktivitas E-Loan Must hari ini
          </p>
        </div>
        <div class="text-sm text-gray-400">
          {{ currentDate() }}
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-20">
          <div class="spinner"></div>
        </div>
      } @else {
        <!-- Main Stats Cards (Clickable) -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <!-- Total Pengajuan -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans()"
          >
            <div class="stat-icon-sm bg-blue-500/20 text-blue-400">📋</div>
            <p class="stat-value-sm">{{ stats()?.totalApplications || 0 }}</p>
            <p class="stat-label-sm">Total Pengajuan</p>
          </div>

          <!-- Menunggu Review -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans('SUBMITTED')"
          >
            <div class="stat-icon-sm bg-amber-500/20 text-amber-400">⏳</div>
            <p class="stat-value-sm">{{ stats()?.pendingReview || 0 }}</p>
            <p class="stat-label-sm">Menunggu Review</p>
          </div>

          <!-- Sudah Review (Menunggu Approval) -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans('REVIEWED')"
          >
            <div class="stat-icon-sm bg-purple-500/20 text-purple-400">✅</div>
            <p class="stat-value-sm">{{ stats()?.pendingApproval || 0 }}</p>
            <p class="stat-label-sm">Menunggu Approval</p>
          </div>

          <!-- Disetujui (Siap Cairkan) -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans('APPROVED')"
          >
            <div class="stat-icon-sm bg-emerald-500/20 text-emerald-400">👍</div>
            <p class="stat-value-sm">{{ stats()?.approved || 0 }}</p>
            <p class="stat-label-sm">Siap Dicairkan</p>
          </div>

          <!-- Sudah Dicairkan -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans('DISBURSED')"
          >
            <div class="stat-icon-sm bg-cyan-500/20 text-cyan-400">💰</div>
            <p class="stat-value-sm">{{ stats()?.disbursed || 0 }}</p>
            <p class="stat-label-sm">Sudah Dicairkan</p>
          </div>

          <!-- Ditolak -->
          <div 
            class="stat-card-clickable cursor-pointer"
            (click)="navigateToLoans('REJECTED')"
          >
            <div class="stat-icon-sm bg-red-500/20 text-red-400">❌</div>
            <p class="stat-value-sm">{{ stats()?.rejected || 0 }}</p>
            <p class="stat-label-sm">Ditolak</p>
          </div>
        </div>

        <!-- Chart & Total Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chart Section -->
          <div class="lg:col-span-2 glass-card">
            <h2 class="text-lg font-bold text-white mb-6">📊 Distribusi Status Pengajuan</h2>
            
            <!-- Simple Bar Chart -->
            <div class="space-y-4">
              <!-- Menunggu Review -->
              <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">Menunggu Review</div>
                <div class="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-amber-500 to-amber-400 flex items-center justify-end pr-3"
                    [style.width]="getBarWidth(stats()?.pendingReview || 0)"
                  >
                    <span class="text-xs font-bold text-white">{{ stats()?.pendingReview || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Menunggu Approval -->
              <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">Menunggu Approval</div>
                <div class="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-end pr-3"
                    [style.width]="getBarWidth(stats()?.pendingApproval || 0)"
                  >
                    <span class="text-xs font-bold text-white">{{ stats()?.pendingApproval || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Siap Dicairkan -->
              <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">Siap Dicairkan</div>
                <div class="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-end pr-3"
                    [style.width]="getBarWidth(stats()?.approved || 0)"
                  >
                    <span class="text-xs font-bold text-white">{{ stats()?.approved || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Sudah Dicairkan -->
              <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">Sudah Dicairkan</div>
                <div class="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 flex items-center justify-end pr-3"
                    [style.width]="getBarWidth(stats()?.disbursed || 0)"
                  >
                    <span class="text-xs font-bold text-white">{{ stats()?.disbursed || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Ditolak -->
              <div class="flex items-center gap-4">
                <div class="w-32 text-sm text-gray-400">Ditolak</div>
                <div class="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-end pr-3"
                    [style.width]="getBarWidth(stats()?.rejected || 0)"
                  >
                    <span class="text-xs font-bold text-white">{{ stats()?.rejected || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Amount Cards -->
          <div class="space-y-6">
            <!-- Total Nilai Pengajuan (All Applications) -->
            <div class="glass-card bg-gradient-to-br from-slate-600/20 to-slate-800/20 border border-slate-500/20">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center text-2xl">📊</div>
                <div>
                  <p class="text-sm text-gray-400">Total Nilai Pengajuan</p>
                  <p class="text-2xl font-bold text-white">{{ stats()?.totalAllAmount || 0 | currency }}</p>
                </div>
              </div>
              <p class="text-xs text-gray-500">Total nominal dari semua pengajuan pinjaman</p>
            </div>

            <!-- Total Pencairan -->
            <div class="glass-card bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/20">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">💰</div>
                <div>
                  <p class="text-sm text-gray-400">Total Pencairan</p>
                  <p class="text-2xl font-bold text-emerald-400">{{ stats()?.totalDisbursedAmount || 0 | currency }}</p>
                </div>
              </div>
              <p class="text-xs text-gray-500">Total dana yang sudah dicairkan ke nasabah</p>
            </div>

            <!-- Quick Actions -->
            <div class="glass-card">
              <h3 class="font-semibold text-white mb-4">⚡ Aksi Cepat</h3>
              <div class="space-y-2">
                <a 
                  routerLink="/admin/loans" 
                  class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <span class="text-blue-400">📋</span>
                  <span class="text-gray-300 group-hover:text-white">Lihat Semua Pengajuan</span>
                </a>
                @if (isSuperAdmin()) {
                  <a 
                    routerLink="/admin/users" 
                    class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span class="text-purple-400">👥</span>
                    <span class="text-gray-300 group-hover:text-white">Kelola User</span>
                  </a>
                  <a 
                    routerLink="/admin/products" 
                    class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <span class="text-amber-400">📦</span>
                    <span class="text-gray-300 group-hover:text-white">Kelola Produk</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Role Badge -->
        <div class="glass-card flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {{ userInitials() }}
            </div>
            <div>
              <p class="text-white font-medium">{{ userName() }}</p>
              <p class="text-sm text-gray-400">{{ currentRoleName() }}</p>
            </div>
          </div>
          <div class="badge badge-blue text-sm px-4 py-2">
            {{ currentRoleName() }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card-clickable {
      @apply glass-card text-center py-4 px-3 hover:bg-white/10 hover:scale-105 transition-all duration-200;
    }
    .stat-icon-sm {
      @apply w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-lg;
    }
    .stat-value-sm {
      @apply text-2xl font-bold text-white;
    }
    .stat-label-sm {
      @apply text-xs text-gray-400 mt-1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private loanService = inject(LoanService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  stats = signal<LoanStatistics | null>(null);
  isLoading = signal(true);

  userName = computed(() => {
    const user = this.tokenService.getUser();
    return user?.firstName || this.tokenService.getUsername() || 'Admin';
  });

  userInitials = computed(() => {
    const name = this.userName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  currentRoleName = computed(() => {
    if (this.isSuperAdmin()) return 'Super Admin';
    if (this.isMarketing()) return 'Marketing';
    if (this.isBranchManager()) return 'Branch Manager';
    if (this.isBackOffice()) return 'Back Office';
    return 'Admin';
  });

  currentDate = computed(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loanService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.stats.set({
          totalApplications: 0,
          pendingReview: 0,
          pendingApproval: 0,
          approved: 0,
          rejected: 0,
          disbursed: 0,
          totalDisbursedAmount: 0,
          totalLoanAmount: 0,
          totalAllAmount: 0
        });
        this.isLoading.set(false);
      }
    });
  }

  navigateToLoans(status?: string): void {
    if (status) {
      this.router.navigate(['/admin/loans'], { queryParams: { status } });
    } else {
      this.router.navigate(['/admin/loans']);
    }
  }

  getBarWidth(value: number): string {
    const total = this.stats()?.totalApplications || 1;
    const percentage = Math.max(5, (value / total) * 100);
    return `${percentage}%`;
  }

  isSuperAdmin(): boolean {
    return this.tokenService.hasRole(AdminRole.SUPER_ADMIN);
  }

  isMarketing(): boolean {
    return this.tokenService.hasRole(AdminRole.MARKETING);
  }

  isBranchManager(): boolean {
    return this.tokenService.hasRole(AdminRole.BRANCH_MANAGER);
  }

  isBackOffice(): boolean {
    return this.tokenService.hasRole(AdminRole.BACK_OFFICE);
  }
}
