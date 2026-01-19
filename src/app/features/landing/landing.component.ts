import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlafondService, LoanService } from '../../shared/services';
import { Plafond, LoanSimulationResponse, ProductDetectionResponse } from '../../core/models';
import { CurrencyPipe, PercentagePipe } from '../../shared/pipes';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, PercentagePipe],
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
  <div class="relative animate-float" style="animation-delay: 1s;">

    <!-- Glow / Glass Backdrop -->
    <div class="absolute inset-0 rounded-full blur-3xl 
                bg-gradient-to-br from-blue-500/20 to-yellow-400/20">
    </div>

    <!-- Main Illustration Image -->
    <img
      src="/images/imageprofile.png"
      alt="Ilustrasi Pinjaman Digital"
      class="relative w-[420px] xl:w-[480px] object-contain drop-shadow-2xl"
    />

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

    <!-- Loan Simulation Section -->
    <section id="simulation" class="py-20 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>
      <div class="container mx-auto px-6 relative">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            <span class="gradient-text-blue">Simulasi</span> Pinjaman
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Hitung estimasi cicilan pinjaman Anda secara real-time
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="glass-card p-8">
            <!-- Result Header -->
            @if (simulationResult()) {
              <div class="bg-gradient-to-r from-blue-600/20 to-amber-500/20 rounded-2xl p-6 mb-8 text-center">
                <p class="text-gray-300 text-sm mb-2">Perkiraan cicilan kamu</p>
                <h3 class="text-4xl font-bold text-white mb-1">
                  {{ simulationResult()!.monthlyInstallment | currency }}
                  <span class="text-xl text-gray-400">/bulan</span>
                </h3>
                <p class="text-gray-400 text-sm">
                  Produk: <span class="text-amber-400 font-semibold">{{ simulationResult()!.plafondName }}</span>
                  • Tenor: {{ simulationResult()!.tenorMonth }} bulan
                </p>
              </div>
            }

            <!-- Amount Input -->
            <div class="mb-8">
              <label class="block text-white font-semibold mb-3">
                Jumlah Pinjaman
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">Rp</span>
                <input
                  type="number"
                  [(ngModel)]="loanAmount"
                  (ngModelChange)="onAmountChange()"
                  class="glass-input pl-12 text-2xl font-bold text-white"
                  placeholder="0"
                  min="0"
                  step="100000"
                />
              </div>
              <input
                type="range"
                [(ngModel)]="loanAmount"
                (ngModelChange)="onAmountChange()"
                [min]="minAmount"
                [max]="maxAmount"
                step="100000"
                class="w-full mt-4 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                       [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r
                       [&::-moz-range-thumb]:from-blue-500 [&::-moz-range-thumb]:to-blue-600
                       [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-2">
                <span>{{ minAmount | currency }}</span>
                <span>{{ maxAmount | currency }}</span>
              </div>
              
              @if (detectedProduct() && detectedProduct()!.found) {
                <div class="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                  <span>✓</span>
                  <span>{{ detectedProduct()!.message }}</span>
                </div>
              } @else if (detectedProduct() && !detectedProduct()!.found) {
                <div class="mt-3 flex items-center gap-2 text-sm text-red-400">
                  <span>⚠</span>
                  <span>{{ detectedProduct()!.message }}</span>
                </div>
              }
            </div>

            <!-- Tenor Selection -->
            <div class="mb-8">
              <label class="block text-white font-semibold mb-3">
                Tenor (Bulan)
              </label>
              <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                @for (tenor of availableTenors; track tenor) {
                  <button
                    type="button"
                    (click)="selectTenor(tenor)"
                    [disabled]="!isTenorAvailable(tenor)"
                    [class.opacity-30]="!isTenorAvailable(tenor)"
                    [class.cursor-not-allowed]="!isTenorAvailable(tenor)"
                    class="py-3 px-2 rounded-lg font-semibold transition-all text-sm"
                    [ngClass]="{
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg': selectedTenor === tenor && isTenorAvailable(tenor),
                      'bg-white/10 text-gray-300 hover:bg-white/20': selectedTenor !== tenor && isTenorAvailable(tenor)
                    }"
                  >
                    {{ tenor }}
                  </button>
                }
              </div>
              @if (maxTenorAllowed > 0) {
                <p class="text-xs text-gray-400 mt-2">
                  Maksimal tenor untuk produk ini: {{ maxTenorAllowed }} bulan
                </p>
              }
            </div>

            <!-- Simulation Results -->
            @if (simulationResult()) {
              <div class="space-y-4 pt-6 border-t border-white/10">
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="bg-white/5 rounded-xl p-4">
                    <p class="text-gray-400 text-sm mb-1">Bunga Per Tahun</p>
                    <p class="text-2xl font-bold text-white">{{ simulationResult()!.actualInterestRate }}%</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-4">
                    <p class="text-gray-400 text-sm mb-1">Total Bunga</p>
                    <p class="text-2xl font-bold text-white">{{ simulationResult()!.totalInterest | currency }}</p>
                  </div>
                </div>
                <div class="bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 rounded-xl p-4">
                  <p class="text-gray-300 text-sm mb-1">Total Pembayaran</p>
                  <p class="text-3xl font-bold text-white">{{ simulationResult()!.totalPayment | currency }}</p>
                </div>
              </div>
            }

            <!-- CTA Button -->
            <button
              class="btn-gold w-full mt-8 py-4 text-lg"
              (click)="showDownloadModal = true"
              [disabled]="!simulationResult()"
            >
              Ajukan Pinjaman Ini
            </button>

            <p class="text-xs text-gray-400 text-center mt-4">
              * Simulasi ini hanya estimasi. Nilai aktual mungkin berbeda setelah verifikasi.
            </p>
          </div>
        </div>
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

                <p class="text-gray-400 text-center text-sm mb-6">{{ product.description || 'Produk pinjaman yang fleksibel' }}</p>

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
  `,
})
export class LandingComponent implements OnInit {
  private plafondService = inject(PlafondService);
  private loanService = inject(LoanService);

  products = signal<Plafond[]>([]);
  isLoading = signal(true);
  showDownloadModal = false;

  // Simulation properties
  loanAmount = 10000000;
  selectedTenor = 6;
  minAmount = 1000000;
  maxAmount = 500000000;
  availableTenors = [1, 3, 6, 9, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  maxTenorAllowed = 0;
  
  detectedProduct = signal<ProductDetectionResponse | null>(null);
  simulationResult = signal<LoanSimulationResponse | null>(null);

  steps = [
    {
      number: 1,
      title: 'Download App',
      description: 'Unduh aplikasi E-Loan Must dari Play Store atau App Store',
    },
    {
      number: 2,
      title: 'Registrasi',
      description: 'Daftar dan lengkapi data diri beserta dokumen yang diperlukan',
    },
    {
      number: 3,
      title: 'Ajukan Pinjaman',
      description: 'Pilih produk dan jumlah pinjaman sesuai kebutuhan Anda',
    },
    {
      number: 4,
      title: 'Terima Dana',
      description: 'Setelah disetujui, dana langsung cair ke rekening Anda',
    },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    // Backend /api/plafonds already returns only active products
    this.plafondService.getAll().subscribe({
      next: (response) => {
        console.log('Plafonds API Response:', response);
        if (response.success && response.data) {
          console.log('Products from API:', response.data);
          console.log('Products count:', response.data.length);
          // No need to filter - backend already returns active only
          this.products.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      },
    });
  }

  getTierName(name: string): string {
    const upperName = name.toUpperCase();
    if (upperName.includes('PLATINUM')) return 'PLATINUM';
    if (upperName.includes('GOLD')) return 'GOLD';
    if (upperName.includes('SILVER')) return 'SILVER';
    return 'SILVER';
  }

  // Simulation methods
  onAmountChange(): void {
    if (this.loanAmount >= this.minAmount) {
      this.detectProduct();
    } else {
      this.detectedProduct.set(null);
      this.simulationResult.set(null);
    }
  }

  detectProduct(): void {
    this.plafondService.detectByAmount(this.loanAmount).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.detectedProduct.set(response.data);
          if (response.data.found && response.data.maxTenorMonth) {
            this.maxTenorAllowed = response.data.maxTenorMonth;
            // Auto-adjust tenor if current selection exceeds max
            if (this.selectedTenor > this.maxTenorAllowed) {
              this.selectedTenor = this.maxTenorAllowed;
            }
            this.runSimulation();
          } else {
            this.simulationResult.set(null);
          }
        }
      },
      error: () => {
        this.detectedProduct.set({
          found: false,
          message: 'Gagal mendeteksi produk. Silakan coba lagi.'
        });
        this.simulationResult.set(null);
      }
    });
  }

  selectTenor(tenor: number): void {
    if (this.isTenorAvailable(tenor)) {
      this.selectedTenor = tenor;
      this.runSimulation();
    }
  }

  isTenorAvailable(tenor: number): boolean {
    if (this.maxTenorAllowed === 0) return false;
    return tenor <= this.maxTenorAllowed;
  }

  runSimulation(): void {
    if (!this.detectedProduct()?.found || !this.selectedTenor) {
      return;
    }

    this.loanService.simulate({
      amount: this.loanAmount,
      tenorMonth: this.selectedTenor
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.simulationResult.set(response.data);
        }
      },
      error: () => {
        // Keep existing simulation or clear if needed
      }
    });
  }
}
