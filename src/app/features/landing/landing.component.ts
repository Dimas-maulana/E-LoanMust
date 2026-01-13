import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlafondService } from '../../shared/services';
import { Plafond } from '../../core/models';
import { CurrencyPipe, PercentagePipe } from '../../shared/pipes';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, PercentagePipe],
  template: `
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Solusi Pinjaman Digital Terpercaya
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Pinjaman Cepat dengan
              <span class="gradient-text-blue"> E-Loan</span>
              <span class="gradient-text-gold"> Must</span>
            </h1>

            <p class="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Ajukan pinjaman dengan mudah melalui aplikasi mobile kami. 
              Proses cepat, aman, dan terpercaya. Dapatkan dana dalam hitungan jam!
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                class="btn-gold text-lg px-8 py-4"
                (click)="showDownloadModal = true"
              >
                Ajukan Pinjaman
              </button>
              <a href="#products" class="btn-outline text-lg px-8 py-4">
                Lihat Produk
              </a>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-6 mt-12">
              <div class="text-center lg:text-left">
                <p class="text-3xl font-bold text-white">50K+</p>
                <p class="text-gray-400 text-sm">Nasabah Aktif</p>
              </div>
              <div class="text-center lg:text-left">
                <p class="text-3xl font-bold text-white">100M+</p>
                <p class="text-gray-400 text-sm">Dana Tersalurkan</p>
              </div>
              <div class="text-center lg:text-left">
                <p class="text-3xl font-bold text-white">4.9</p>
                <p class="text-gray-400 text-sm">Rating Aplikasi</p>
              </div>
            </div>
          </div>

          <!-- Illustration -->
          <div class="hidden lg:flex justify-center relative">
            <div class="relative">
              <!-- Floating Cards -->
              <div class="glass-card p-6 w-64 animate-float" style="animation-delay: 0s;">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <p class="text-white font-semibold">Pinjaman Cair</p>
                    <p class="text-gray-400 text-sm">Rp 50.000.000</p>
                  </div>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 w-3/4 rounded-full"></div>
                </div>
              </div>

              <div class="glass-card p-6 w-56 absolute -bottom-8 -left-20 animate-float" style="animation-delay: 1s;">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-gray-400 text-sm">Status</span>
                  <span class="badge badge-green">Disetujui</span>
                </div>
                <p class="text-white font-semibold">Pengajuan #2024001</p>
              </div>

              <div class="glass-card p-4 absolute -top-8 -right-8 animate-float" style="animation-delay: 2s;">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    ✓
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">Proses Cepat</p>
                    <p class="text-gray-400 text-xs">24 Jam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#products" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Products Section -->
    <section id="products" class="py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Pilihan <span class="gradient-text-gold">Produk</span> Pinjaman
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Kami menyediakan berbagai pilihan produk pinjaman yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="spinner"></div>
          </div>
        } @else {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (product of products(); track product.id; let i = $index) {
              <div 
                class="glass-card relative overflow-hidden group"
                [class.border-amber-500/30]="getTierName(product.name) === 'GOLD'"
                [class.border-blue-500/30]="getTierName(product.name) === 'SILVER'"
                [class.border-purple-500/30]="getTierName(product.name) === 'PLATINUM'"
              >
                <!-- Badge -->
                @if (getTierName(product.name) === 'GOLD') {
                  <div class="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                    POPULER
                  </div>
                }

                <!-- Tier Icon -->
                <div 
                  class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto"
                  [ngClass]="{
                    'bg-amber-500/20': getTierName(product.name) === 'GOLD',
                    'bg-gray-500/20': getTierName(product.name) === 'SILVER',
                    'bg-purple-500/20': getTierName(product.name) === 'PLATINUM'
                  }"
                >
                  @switch (getTierName(product.name)) {
                    @case ('SILVER') { 🥈 }
                    @case ('GOLD') { 🥇 }
                    @case ('PLATINUM') { 💎 }
                    @default { 💰 }
                  }
                </div>

                <!-- Product Name -->
                <h3 
                  class="text-2xl font-bold text-center mb-2"
                  [ngClass]="{
                    'text-amber-400': getTierName(product.name) === 'GOLD',
                    'text-gray-300': getTierName(product.name) === 'SILVER',
                    'text-purple-400': getTierName(product.name) === 'PLATINUM'
                  }"
                >
                  {{ product.name }}
                </h3>

                <p class="text-gray-400 text-center text-sm mb-6">{{ product.description }}</p>

                <!-- Details -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center py-3 border-b border-white/10">
                    <span class="text-gray-400">Plafon</span>
                    <span class="text-white font-semibold">
                      {{ product.minAmount | currency }} - {{ product.maxAmount | currency }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-white/10">
                    <span class="text-gray-400">Tenor</span>
                    <span class="text-white font-semibold">{{ product.minTenor }} - {{ product.maxTenor }} Bulan</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-white/10">
                    <span class="text-gray-400">Bunga</span>
                    <span class="text-white font-semibold">{{ product.interestRate | percentage }} / tahun</span>
                  </div>
                </div>

                <!-- CTA -->
                <button 
                  class="w-full mt-6 py-3 rounded-xl font-semibold transition-all"
                  [ngClass]="{
                    'btn-gold': getTierName(product.name) === 'GOLD',
                    'btn-primary': getTierName(product.name) !== 'GOLD'
                  }"
                  (click)="showDownloadModal = true"
                >
                  Ajukan Sekarang
                </button>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section id="about" class="py-20 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>
      <div class="container mx-auto px-6 relative">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Mengapa Memilih <span class="gradient-text-blue">E-Loan Must</span>?
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Kami berkomitmen memberikan layanan terbaik untuk kebutuhan finansial Anda
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Proses Cepat</h3>
            <p class="text-gray-400 text-sm">Pengajuan diproses dalam waktu 24 jam kerja</p>
          </div>

          <div class="glass-card text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Aman & Terpercaya</h3>
            <p class="text-gray-400 text-sm">Data Anda dilindungi dengan enkripsi terbaik</p>
          </div>

          <div class="glass-card text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              📱
            </div>
            <h3 class="text-lg font-bold text-white mb-2">100% Online</h3>
            <p class="text-gray-400 text-sm">Ajukan dari mana saja melalui aplikasi mobile</p>
          </div>

          <div class="glass-card text-center group hover:scale-105 transition-transform">
            <div class="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Support 24/7</h3>
            <p class="text-gray-400 text-sm">Tim support siap membantu kapanpun Anda butuhkan</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Cara <span class="gradient-text-gold">Mengajukan</span> Pinjaman
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Proses pengajuan pinjaman yang mudah hanya dalam 4 langkah
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (step of steps; track step.number) {
            <div class="relative">
              <!-- Connector Line -->
              @if (!$last) {
                <div class="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent -z-10"></div>
              }

              <div class="glass-card text-center">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {{ step.number }}
                </div>
                <h3 class="text-lg font-bold text-white mb-2">{{ step.title }}</h3>
                <p class="text-gray-400 text-sm">{{ step.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="contact" class="py-20">
      <div class="container mx-auto px-6">
        <div class="glass-card relative overflow-hidden">
          <!-- Background Gradient -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-amber-500/20"></div>
          
          <div class="relative text-center py-12">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Ajukan Pinjaman?
            </h2>
            <p class="text-gray-300 max-w-xl mx-auto mb-8">
              Unduh aplikasi E-Loan Must sekarang dan dapatkan pinjaman dengan proses cepat dan mudah!
            </p>
            <button 
              class="btn-gold text-lg px-8 py-4"
              (click)="showDownloadModal = true"
            >
              Download Aplikasi
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Download Modal -->
    @if (showDownloadModal) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        (click)="showDownloadModal = false"
      >
        <div 
          class="glass-card max-w-md w-full mx-4 p-8 text-center"
          (click)="$event.stopPropagation()"
        >
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-4xl mx-auto mb-6">
            📱
          </div>
          
          <h3 class="text-2xl font-bold text-white mb-4">Download Aplikasi Mobile</h3>
          
          <p class="text-gray-400 mb-6">
            Untuk mengajukan pinjaman, silakan download aplikasi <strong class="text-white">E-Loan Must</strong> 
            di smartphone Anda melalui Google Play Store atau Apple App Store.
          </p>

          <div class="flex justify-center gap-4 mb-6">
            <a href="#" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <span class="text-2xl">🤖</span>
              <div class="text-left">
                <p class="text-xs text-gray-400">GET IT ON</p>
                <p class="text-white font-semibold">Google Play</p>
              </div>
            </a>
            <a href="#" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <span class="text-2xl">🍎</span>
              <div class="text-left">
                <p class="text-xs text-gray-400">Download on</p>
                <p class="text-white font-semibold">App Store</p>
              </div>
            </a>
          </div>

          <button 
            class="text-gray-400 hover:text-white transition-colors"
            (click)="showDownloadModal = false"
          >
            Tutup
          </button>
        </div>
      </div>
    }
  `
})
export class LandingComponent implements OnInit {
  private plafondService = inject(PlafondService);

  products = signal<Plafond[]>([]);
  isLoading = signal(true);
  showDownloadModal = false;

  steps = [
    {
      number: 1,
      title: 'Download App',
      description: 'Unduh aplikasi E-Loan Must dari Play Store atau App Store'
    },
    {
      number: 2,
      title: 'Registrasi',
      description: 'Daftar dan lengkapi data diri beserta dokumen yang diperlukan'
    },
    {
      number: 3,
      title: 'Ajukan Pinjaman',
      description: 'Pilih produk dan jumlah pinjaman sesuai kebutuhan Anda'
    },
    {
      number: 4,
      title: 'Terima Dana',
      description: 'Setelah disetujui, dana langsung cair ke rekening Anda'
    }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.plafondService.getActive().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        // Use dummy data if API fails
        this.products.set([
          {
            id: 1,
            name: 'Silver',
            code: 'SILVER',
            description: 'Pinjaman ringan untuk kebutuhan mendesak',
            minAmount: 1000000,
            maxAmount: 10000000,
            minTenor: 3,
            maxTenor: 12,
            interestRate: 12,
            active: true
          },
          {
            id: 2,
            name: 'Gold',
            code: 'GOLD',
            description: 'Pinjaman fleksibel untuk berbagai kebutuhan',
            minAmount: 10000000,
            maxAmount: 50000000,
            minTenor: 6,
            maxTenor: 24,
            interestRate: 10,
            active: true
          },
          {
            id: 3,
            name: 'Platinum',
            code: 'PLATINUM',
            description: 'Pinjaman premium dengan limit tinggi',
            minAmount: 50000000,
            maxAmount: 200000000,
            minTenor: 12,
            maxTenor: 36,
            interestRate: 8,
            active: true
          }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  getTierName(name: string): string {
    const upperName = name.toUpperCase();
    if (upperName.includes('PLATINUM')) return 'PLATINUM';
    if (upperName.includes('GOLD')) return 'GOLD';
    if (upperName.includes('SILVER')) return 'SILVER';
    return 'SILVER';
  }
}
