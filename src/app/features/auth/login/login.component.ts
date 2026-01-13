import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../shared/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0">
        <div class="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      </div>

      <!-- Login Card -->
      <div class="glass-card w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="images/logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4 object-contain filter drop-shadow-lg">
          <div class="flex items-baseline justify-center">
            <span class="text-2xl font-bold text-blue-400">E-Loan</span>
            <span class="text-2xl font-bold text-amber-400 ml-1">Must</span>
          </div>
          <p class="text-gray-400 mt-2">Admin Portal</p>
        </div>

        <!-- Error Alert -->
        @if (errorMessage()) {
          <div class="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <!-- Session Expired Alert -->
        @if (sessionExpired()) {
          <div class="mb-6 p-4 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm">
            Sesi Anda telah berakhir. Silakan login kembali.
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text"
              [(ngModel)]="username"
              name="username"
              class="glass-input"
              placeholder="Masukkan username"
              required
              [disabled]="isLoading()"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div class="relative">
              <input 
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                class="glass-input pr-12"
                placeholder="Masukkan password"
                required
                [disabled]="isLoading()"
              />
              <button 
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                (click)="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="flex justify-end">
            <a routerLink="/auth/forgot-password" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Lupa password?
            </a>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn-primary w-full py-4 text-lg"
            [disabled]="isLoading() || !username || !password"
          >
            @if (isLoading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Memproses...
              </span>
            } @else {
              Masuk
            }
          </button>
        </form>

        <!-- Back to Landing -->
        <div class="mt-6 text-center">
          <a routerLink="/" class="text-gray-400 hover:text-white transition-colors text-sm">
            ← Kembali ke halaman utama
          </a>
        </div>

        <!-- Info -->
        <div class="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p class="text-xs text-gray-400 text-center">
            Portal ini hanya untuk <strong class="text-blue-400">Admin Internal</strong>. 
            Jika Anda seorang customer, silakan gunakan aplikasi mobile untuk mengajukan pinjaman.
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  showPassword = false;
  isLoading = signal(false);
  errorMessage = signal('');
  sessionExpired = signal(false);

  constructor() {
    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session_expired') {
        this.sessionExpired.set(true);
      }
      if (params['error'] === 'access_denied') {
        this.errorMessage.set('Anda tidak memiliki akses ke halaman ini.');
      }
    });
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Username dan password harus diisi.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.sessionExpired.set(false);

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.toastService.success('Login berhasil! Selamat datang.');
          
          // Redirect to return URL or dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Login gagal. Silakan coba lagi.');
      }
    });
  }
}
