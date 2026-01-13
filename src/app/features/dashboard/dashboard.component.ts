import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService, NotificationService } from '../../shared/services';
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (isSuperAdmin() || isMarketing()) {
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div class="stat-icon bg-blue-500/20 text-blue-400">📋</div>
              <span class="badge badge-blue">Baru</span>
            </div>
            <p class="stat-value mt-4">{{ stats()?.pendingReview || 0 }}</p>
            <p class="stat-label">Menunggu Review</p>
          </div>
        }

        @if (isSuperAdmin() || isBranchManager()) {
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div class="stat-icon bg-amber-500/20 text-amber-400">⏳</div>
              <span class="badge badge-gold">Pending</span>
            </div>
            <p class="stat-value mt-4">{{ stats()?.pendingApproval || 0 }}</p>
            <p class="stat-label">Menunggu Approval</p>
          </div>
        }

        @if (isSuperAdmin() || isBackOffice()) {
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div class="stat-icon bg-emerald-500/20 text-emerald-400">✅</div>
              <span class="badge badge-green">Ready</span>
            </div>
            <p class="stat-value mt-4">{{ stats()?.approved || 0 }}</p>
            <p class="stat-label">Siap Dicairkan</p>
          </div>
        }

        @if (isSuperAdmin()) {
          <div class="stat-card">
            <div class="flex items-center justify-between">
              <div class="stat-icon bg-purple-500/20 text-purple-400">💰</div>
              <span class="badge badge-purple">Total</span>
            </div>
            <p class="stat-value mt-4">{{ stats()?.totalDisbursedAmount || 0 | currency }}</p>
            <p class="stat-label">Total Pencairan</p>
          </div>
        }
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 glass-card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-white">Statistik Pengajuan</h2>
            <select class="glass-select w-32 text-sm py-2">
              <option>7 Hari</option>
              <option>30 Hari</option>
              <option>90 Hari</option>
            </select>
          </div>

          <!-- Chart Placeholder -->
          <div class="h-64 flex items-center justify-center bg-slate-800/50 rounded-xl">
            <div class="text-center">
              <p class="text-4xl mb-2">📊</p>
              <p class="text-gray-400">Grafik statistik akan ditampilkan di sini</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-card">
          <h2 class="text-lg font-bold text-white mb-6">Aksi Cepat</h2>
          <div class="space-y-3">
            @if (isMarketing()) {
              <a 
                routerLink="/admin/review" 
                class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div>
                  <p class="text-white font-medium">Review Pengajuan</p>
                  <p class="text-gray-400 text-sm">{{ stats()?.pendingReview || 0 }} pengajuan baru</p>
                </div>
              </a>
            }

            @if (isBranchManager()) {
              <a 
                routerLink="/admin/approval" 
                class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  ✅
                </div>
                <div>
                  <p class="text-white font-medium">Approval Pinjaman</p>
                  <p class="text-gray-400 text-sm">{{ stats()?.pendingApproval || 0 }} menunggu</p>
                </div>
              </a>
            }

            @if (isBackOffice()) {
              <a 
                routerLink="/admin/disbursement" 
                class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div>
                  <p class="text-white font-medium">Pencairan Dana</p>
                  <p class="text-gray-400 text-sm">{{ stats()?.approved || 0 }} siap dicairkan</p>
                </div>
              </a>
            }

            @if (isSuperAdmin()) {
              <a 
                routerLink="/admin/users" 
                class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  👥
                </div>
                <div>
                  <p class="text-white font-medium">Kelola User</p>
                  <p class="text-gray-400 text-sm">Manajemen pengguna</p>
                </div>
              </a>
              <a 
                routerLink="/admin/products" 
                class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div>
                  <p class="text-white font-medium">Kelola Produk</p>
                  <p class="text-gray-400 text-sm">Pengaturan plafond</p>
                </div>
              </a>
            }

            <a 
              routerLink="/admin/notifications" 
              class="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                🔔
              </div>
              <div>
                <p class="text-white font-medium">Notifikasi</p>
                <p class="text-gray-400 text-sm">Lihat semua notifikasi</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-white mb-2">{{ stats()?.totalApplications || 0 }}</p>
          <p class="text-gray-400 text-sm">Total Pengajuan</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-emerald-400 mb-2">{{ stats()?.approved || 0 }}</p>
          <p class="text-gray-400 text-sm">Disetujui</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-red-400 mb-2">{{ stats()?.rejected || 0 }}</p>
          <p class="text-gray-400 text-sm">Ditolak</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-blue-400 mb-2">{{ stats()?.disbursed || 0 }}</p>
          <p class="text-gray-400 text-sm">Dicairkan</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private loanService = inject(LoanService);
  private tokenService = inject(TokenService);

  stats = signal<LoanStatistics | null>(null);
  isLoading = signal(true);

  userName = computed(() => {
    const user = this.tokenService.getUser();
    return user?.firstName || this.tokenService.getUsername() || 'Admin';
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
      error: () => {
        // Use dummy data
        this.stats.set({
          totalApplications: 150,
          pendingReview: 12,
          pendingApproval: 8,
          approved: 45,
          rejected: 15,
          disbursed: 70,
          totalDisbursedAmount: 1500000000
        });
        this.isLoading.set(false);
      }
    });
  }

  isSuperAdmin(): boolean {
    return this.tokenService.hasRole(AdminRole.SUPER_ADMIN);
  }

  isMarketing(): boolean {
    return this.tokenService.hasRole(AdminRole.MARKETING) || this.isSuperAdmin();
  }

  isBranchManager(): boolean {
    return this.tokenService.hasRole(AdminRole.BRANCH_MANAGER) || this.isSuperAdmin();
  }

  isBackOffice(): boolean {
    return this.tokenService.hasRole(AdminRole.BACK_OFFICE) || this.isSuperAdmin();
  }
}
