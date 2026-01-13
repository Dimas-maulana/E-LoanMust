import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../shared/services';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0">
        <div class="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      </div>

      <!-- Card -->
      <div class="glass-card w-full max-w-md relative z-10">
        @if (!resetSuccess()) {
          <!-- Reset Form -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <span class="text-4xl">🔑</span>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p class="text-gray-400">Masukkan password baru Anda.</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
              <div class="relative">
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  class="glass-input pr-12"
                  placeholder="Minimal 8 karakter"
                  required
                  [disabled]="isLoading()"
                />
                <button 
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  (click)="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Konfirmasi Password</label>
              <input 
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                class="glass-input"
                placeholder="Ulangi password baru"
                required
                [disabled]="isLoading()"
              />
            </div>

            <!-- Password Requirements -->
            <div class="p-4 rounded-xl bg-slate-800/50">
              <p class="text-xs text-gray-400 mb-2">Password harus memenuhi:</p>
              <ul class="text-xs space-y-1">
                <li [class.text-emerald-400]="newPassword.length >= 8" [class.text-gray-500]="newPassword.length < 8">
                  {{ newPassword.length >= 8 ? '✓' : '○' }} Minimal 8 karakter
                </li>
                <li [class.text-emerald-400]="hasUppercase()" [class.text-gray-500]="!hasUppercase()">
                  {{ hasUppercase() ? '✓' : '○' }} Minimal 1 huruf besar
                </li>
                <li [class.text-emerald-400]="hasNumber()" [class.text-gray-500]="!hasNumber()">
                  {{ hasNumber() ? '✓' : '○' }} Minimal 1 angka
                </li>
                <li [class.text-emerald-400]="passwordsMatch()" [class.text-gray-500]="!passwordsMatch()">
                  {{ passwordsMatch() ? '✓' : '○' }} Password cocok
                </li>
              </ul>
            </div>

            <button 
              type="submit" 
              class="btn-primary w-full py-4"
              [disabled]="isLoading() || !isValid()"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Menyimpan...
                </span>
              } @else {
                Reset Password
              }
            </button>
          </form>
        } @else {
          <!-- Success Message -->
          <div class="text-center">
            <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <span class="text-5xl">✓</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-4">Password Berhasil Direset!</h2>
            <p class="text-gray-400 mb-6">
              Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
            </p>
            <a routerLink="/auth/login" class="btn-primary w-full py-3 block text-center">
              Ke Halaman Login
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = signal(false);
  resetSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.errorMessage.set('Token reset password tidak valid atau sudah kadaluarsa.');
      }
    });
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.newPassword);
  }

  passwordsMatch(): boolean {
    return this.newPassword.length > 0 && this.newPassword === this.confirmPassword;
  }

  isValid(): boolean {
    return (
      this.newPassword.length >= 8 &&
      this.hasUppercase() &&
      this.hasNumber() &&
      this.passwordsMatch() &&
      !!this.token
    );
  }

  onSubmit(): void {
    if (!this.isValid()) {
      this.errorMessage.set('Pastikan semua persyaratan password terpenuhi.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.resetSuccess.set(true);
          this.toastService.success('Password berhasil direset!');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Gagal mereset password. Silakan coba lagi.');
      }
    });
  }
}
