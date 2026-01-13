import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0">
        <div class="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
      </div>

      <div class="glass-card max-w-md w-full text-center relative z-10">
        <!-- 404 Icon -->
        <div class="w-32 h-32 rounded-3xl bg-red-500/20 flex items-center justify-center mx-auto mb-8">
          <span class="text-6xl">🚫</span>
        </div>

        <!-- Error Message -->
        <h1 class="text-6xl font-bold text-white mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-300 mb-4">Halaman Tidak Ditemukan</h2>
        <p class="text-gray-400 mb-8">
          Maaf, halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" class="btn-primary">
            Ke Halaman Utama
          </a>
          <button 
            class="btn-outline"
            (click)="goBack()"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
