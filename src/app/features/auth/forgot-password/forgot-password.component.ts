import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../shared/services';

@Component({
  selector: 'app-forgot-password',
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
        @if (!emailSent()) {
          <!-- Forgot Password Form -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <span class="text-4xl">🔐</span>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Lupa Password?</h1>
            <p class="text-gray-400">Masukkan email Anda dan kami akan mengirimkan link untuk reset password.</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {{ errorMessage() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input 
                type="email"
                [(ngModel)]="email"
                name="email"
                class="glass-input"
                placeholder="Masukkan email Anda"
                required
                [disabled]="isLoading()"
              />
            </div>

            <button 
              type="submit" 
              class="btn-primary w-full py-4"
              [disabled]="isLoading() || !email"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Mengirim...
                </span>
              } @else {
                Kirim Link Reset
              }
            </button>
          </form>
        } @else {
          <!-- Success Message -->
          <div class="text-center">
            <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <span class="text-5xl">✉️</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-4">Email Terkirim!</h2>
            <p class="text-gray-400 mb-6">
              Kami telah mengirimkan link reset password ke email <strong class="text-white">{{ email }}</strong>. 
              Silakan cek inbox atau folder spam Anda.
            </p>
            <button 
              class="btn-outline w-full py-3"
              (click)="emailSent.set(false); email = ''"
            >
              Kirim ulang
            </button>
          </div>
        }

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <a routerLink="/auth/login" class="text-gray-400 hover:text-white transition-colors text-sm">
            ← Kembali ke halaman login
          </a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email = '';
  isLoading = signal(false);
  emailSent = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage.set('Email harus diisi.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.emailSent.set(true);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        // Always show success to prevent email enumeration
        this.emailSent.set(true);
      }
    });
  }
}
