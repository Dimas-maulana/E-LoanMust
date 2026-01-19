import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center group relative">
            <img
              src="/images/eloanmust.png"
              alt="E-Loan Must"
              class="
      h-20
      xl:h-18
      w-auto
      object-contain
      scale-110
      transition-transform duration-300
      group-hover:scale-125
      origin-left
    "
            />
          </a>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#products" class="text-gray-300 hover:text-white transition-colors">Produk</a>
            <a href="#about" class="text-gray-300 hover:text-white transition-colors"
              >Tentang Kami</a
            >
            <a href="#contact" class="text-gray-300 hover:text-white transition-colors">Kontak</a>
            <a routerLink="/auth/login" class="btn-primary"> Login Admin </a>
          </div>

          <!-- Mobile Menu Button -->
          <button class="md:hidden p-2 text-white" (click)="mobileMenuOpen = !mobileMenuOpen">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (mobileMenuOpen) {
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
              } @else {
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              }
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen) {
        <div class="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
          <div class="flex flex-col gap-4">
            <a
              href="#products"
              class="text-gray-300 hover:text-white transition-colors"
              (click)="mobileMenuOpen = false"
              >Produk</a
            >
            <a
              href="#about"
              class="text-gray-300 hover:text-white transition-colors"
              (click)="mobileMenuOpen = false"
              >Tentang Kami</a
            >
            <a
              href="#contact"
              class="text-gray-300 hover:text-white transition-colors"
              (click)="mobileMenuOpen = false"
              >Kontak</a
            >
            <a
              routerLink="/auth/login"
              class="btn-primary text-center"
              (click)="mobileMenuOpen = false"
            >
              Login Admin
            </a>
          </div>
        </div>
        }
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-20">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="glass-panel border-t border-white/10 mt-20">
      <div class="container mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
              >
                <span class="text-white font-bold text-xl">E</span>
              </div>
              <div class="flex items-baseline">
                <span class="text-xl font-bold text-blue-400">E-Loan</span>
                <span class="text-xl font-bold text-amber-400 ml-1">Must</span>
              </div>
            </div>
            <p class="text-gray-400 mb-4 max-w-md">
              Solusi pinjaman digital yang cepat, mudah, dan terpercaya. Didukung oleh teknologi
              canggih untuk pengalaman pengguna terbaik.
            </p>
            <div class="flex gap-4">
              <a
                href="#"
                class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all"
              >
                f
              </a>
              <a
                href="#"
                class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all"
              >
                in
              </a>
              <a
                href="#"
                class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all"
              >
                ig
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Produk</h4>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Silver</a>
              </li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Gold</a></li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white transition-colors">Platinum</a>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white font-semibold mb-4">Kontak</h4>
            <ul class="space-y-2 text-gray-400">
              <li>📧 info&#64;eloanmust.com</li>
              <li>📞 021-1234567</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div
          class="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p class="text-gray-500 text-sm">© 2026 E-Loan Must. All rights reserved.</p>
          <div class="flex gap-6 text-sm">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors"
              >Terms of Service</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicLayoutComponent {
  mobileMenuOpen = false;
}
