import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoanService, ToastService } from '../../shared/services';
import { TokenService } from '../../core/auth';
import { LoanApplication, LoanStatus, AdminRole, ApiResponse } from '../../core/models';
import { StatusBadgeComponent, ConfirmModalComponent } from '../../shared/components';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';
import { environment } from '../../../environments/environment';

// User Profile Interface matching API response
interface UserProfile {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  address: string;
  identityNumber: string;
  tanggalLahir: string | null;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  ktpUrl: string;
  hasKtpUploaded: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    ConfirmModalComponent,
    CurrencyPipe,
    DateFormatPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Back Button & Header -->
      <div class="flex items-center gap-4">
        <button 
          class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          (click)="goBack()"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-white">Detail Pengajuan</h1>
          <p class="text-gray-400 font-mono">ID: {{ loan()?.id || 'Loading...' }}</p>
        </div>
        <app-status-badge [status]="loan()?.status || ''"></app-status-badge>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center py-20">
          <div class="spinner"></div>
        </div>
      } @else if (loan()) {
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Customer Info & KTP -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Customer Info Card -->
            <div class="glass-card">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>👤</span> Informasi Customer
              </h2>
              <div class="space-y-3">
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">Nama Lengkap</span>
                  <span class="text-white font-medium">{{ userProfile()?.fullName || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">NIK</span>
                  <span class="text-white font-mono">{{ userProfile()?.identityNumber || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">Email</span>
                  <span class="text-white">{{ userProfile()?.email || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">Username</span>
                  <span class="text-white">{{ userProfile()?.username || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">Alamat</span>
                  <span class="text-white text-right max-w-[200px]">{{ userProfile()?.address || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">Bank</span>
                  <span class="text-white">{{ userProfile()?.bankName || '-' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-white/10">
                  <span class="text-gray-400">No. Rekening</span>
                  <span class="text-white font-mono">{{ userProfile()?.bankAccountNumber || '-' }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-400">Nama Rekening</span>
                  <span class="text-white">{{ userProfile()?.bankAccountHolderName || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- KTP Image Card -->
            <div class="glass-card">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🪪</span> Foto KTP
              </h2>
              @if (ktpImageUrl()) {
                <div class="relative group">
                  <img 
                    [src]="ktpImageUrl()" 
                    alt="Foto KTP"
                    class="w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                    (click)="showKtpPreview = true"
                    (error)="onKtpImageError($event)"
                  />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span class="text-white text-sm">Klik untuk memperbesar</span>
                  </div>
                </div>
              } @else if (isLoadingProfile()) {
                <div class="flex flex-col items-center justify-center py-8 bg-slate-800/50 rounded-lg">
                  <div class="spinner"></div>
                  <p class="text-gray-400 text-sm mt-2">Memuat foto KTP...</p>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-8 bg-slate-800/50 rounded-lg">
                  <span class="text-4xl mb-2">🪪</span>
                  <p class="text-gray-400 text-sm">Foto KTP tidak tersedia</p>
                </div>
              }
            </div>

            <!-- Location Map Card -->
            @if (hasLocation()) {
              <div class="glass-card">
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📍</span> Lokasi User
                </h2>
                <div class="rounded-lg overflow-hidden border border-white/10 bg-slate-800/50 relative h-64">
                   <iframe 
                    [src]="getMapUrl()" 
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
                <div class="mt-3 flex gap-2 text-xs text-gray-400">
                  <span class="bg-white/5 px-2 py-1 rounded">Lat: {{ loan()?.latitude }}</span>
                  <span class="bg-white/5 px-2 py-1 rounded">Long: {{ loan()?.longitude }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Loan Info & Actions -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Loan Info Card -->
            <div class="glass-card">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>💰</span> Informasi Pinjaman
              </h2>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Produk</p>
                  <p class="text-xl font-bold text-amber-400">{{ getPlafondName() }}</p>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Status</p>
                  <app-status-badge [status]="loan()?.status || ''"></app-status-badge>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Jumlah Pinjaman</p>
                  <p class="text-xl font-bold text-white">{{ loan()?.amount | currency }}</p>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Tenor</p>
                  <p class="text-xl font-bold text-white">{{ getTenorValue() }} Bulan</p>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Bunga</p>
                  <p class="text-xl font-bold text-blue-400">{{ getInterestRate() }}%</p>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4">
                  <p class="text-gray-400 text-sm mb-1">Cicilan / Bulan</p>
                  <p class="text-xl font-bold text-emerald-400">{{ loan()?.monthlyInstallment | currency }}</p>
                </div>
                <div class="bg-slate-800/50 rounded-xl p-4 md:col-span-2">
                  <p class="text-gray-400 text-sm mb-1">Total Pembayaran</p>
                  <p class="text-2xl font-bold text-white">{{ loan()?.totalPayment | currency }}</p>
                </div>
              </div>
            </div>

            <!-- History & Notes Card -->
            <div class="glass-card">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Riwayat & Catatan
              </h2>
              <div class="space-y-4">
                <!-- Created -->
                <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">📋</div>
                  <div>
                    <p class="text-white font-medium">Pengajuan Dibuat</p>
                    <p class="text-gray-400 text-sm">{{ loan()?.createdAt | dateFormat }}</p>
                  </div>
                </div>

                <!-- Review -->
                @if (loan()?.reviewedAt) {
                  <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">✅</div>
                    <div class="flex-1">
                      <p class="text-white font-medium">Direview oleh {{ loan()?.reviewedBy?.firstName || 'Marketing' }}</p>
                      <p class="text-gray-400 text-sm">{{ loan()?.reviewedAt | dateFormat }}</p>
                      @if (loan()?.reviewNotes) {
                        <p class="text-gray-300 text-sm mt-2 p-2 bg-white/5 rounded">{{ loan()?.reviewNotes }}</p>
                      }
                    </div>
                  </div>
                }

                <!-- Approval -->
                @if (loan()?.approvedAt) {
                  <div class="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">👍</div>
                    <div class="flex-1">
                      <p class="text-white font-medium">Disetujui oleh {{ loan()?.approvedBy?.firstName || 'Branch Manager' }}</p>
                      <p class="text-gray-400 text-sm">{{ loan()?.approvedAt | dateFormat }}</p>
                      @if (loan()?.approvalNotes) {
                        <p class="text-gray-300 text-sm mt-2 p-2 bg-white/5 rounded">{{ loan()?.approvalNotes }}</p>
                      }
                    </div>
                  </div>
                }

                <!-- Rejection -->
                @if (loan()?.status === LoanStatus.REJECTED && loan()?.rejectionReason) {
                  <div class="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">❌</div>
                    <div class="flex-1">
                      <p class="text-red-400 font-medium">Ditolak</p>
                      <p class="text-gray-300 text-sm mt-1">{{ loan()?.rejectionReason }}</p>
                    </div>
                  </div>
                }

                <!-- Disbursement -->
                @if (loan()?.disbursedAt) {
                  <div class="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">💰</div>
                    <div class="flex-1">
                      <p class="text-emerald-400 font-medium">Dana Dicairkan</p>
                      <p class="text-gray-400 text-sm">{{ loan()?.disbursedAt | dateFormat }}</p>
                      <p class="text-white font-semibold mt-1">{{ loan()?.disbursementAmount | currency }}</p>
                      @if (loan()?.disbursementNotes) {
                        <p class="text-gray-300 text-sm mt-2 p-2 bg-white/5 rounded">{{ loan()?.disbursementNotes }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Actions Card -->
            @if (canTakeAction()) {
              <div class="glass-card">
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚡</span> Aksi
                </h2>

                <!-- Review Actions (Marketing) -->
                @if (canReview()) {
                  <div class="space-y-4">
                    <textarea 
                      [(ngModel)]="actionNotes"
                      class="glass-textarea w-full"
                      rows="3"
                      placeholder="Masukkan catatan review..."
                    ></textarea>
                    <div class="flex gap-3">
                      @if (loan()?.status === LoanStatus.SUBMITTED) {
                        <button 
                          class="btn-primary flex-1"
                          (click)="startReview()"
                          [disabled]="isProcessing()"
                        >
                          Mulai Review
                        </button>
                      } @else {
                        <button 
                          class="btn-success flex-1"
                          (click)="completeReview()"
                          [disabled]="isProcessing()"
                        >
                          Selesai Review
                        </button>
                      }
                    </div>
                  </div>
                }

                <!-- Approval Actions (Branch Manager) -->
                @if (canApprove()) {
                  <div class="space-y-4">
                    <textarea 
                      [(ngModel)]="actionNotes"
                      class="glass-textarea w-full"
                      rows="3"
                      placeholder="Masukkan catatan approval..."
                    ></textarea>
                    <div class="flex gap-3">
                      <button 
                        class="btn-success flex-1"
                        (click)="approve()"
                        [disabled]="isProcessing()"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        class="btn-danger flex-1"
                        (click)="showRejectModal = true"
                        [disabled]="isProcessing()"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                }

                <!-- Disbursement Actions (Back Office) -->
                @if (canDisburse()) {
                  <div class="space-y-4">
                    <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <p class="text-emerald-400 font-medium mb-2">Dana yang akan dicairkan:</p>
                      <p class="text-2xl font-bold text-white">{{ loan()?.amount | currency }}</p>
                    </div>
                    <textarea 
                      [(ngModel)]="actionNotes"
                      class="glass-textarea w-full"
                      rows="3"
                      placeholder="Masukkan catatan pencairan (opsional)..."
                    ></textarea>
                    <button 
                      class="btn-success w-full"
                      (click)="disburse()"
                      [disabled]="isProcessing()"
                    >
                      💰 Proses Pencairan
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="glass-card text-center py-12">
          <span class="text-6xl mb-4 block">❌</span>
          <h2 class="text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h2>
          <p class="text-gray-400 mb-6">Pengajuan pinjaman tidak ditemukan atau Anda tidak memiliki akses.</p>
          <button class="btn-primary" (click)="goBack()">Kembali</button>
        </div>
      }
    </div>

    <!-- KTP Preview Modal -->
    @if (showKtpPreview && ktpImageUrl()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        (click)="showKtpPreview = false"
      >
        <div class="relative max-w-4xl max-h-[90vh]">
          <img 
            [src]="ktpImageUrl()" 
            alt="Foto KTP"
            class="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <button 
            class="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            (click)="showKtpPreview = false"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }

    <!-- Reject Modal -->
    @if (showRejectModal) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        (click)="showRejectModal = false"
      >
        <div 
          class="glass-card max-w-md w-full"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-xl font-bold text-white mb-4">Tolak Pengajuan</h2>
          <p class="text-gray-400 mb-4">Masukkan alasan penolakan:</p>
          <textarea 
            [(ngModel)]="rejectionReason"
            class="glass-textarea w-full mb-4"
            rows="4"
            placeholder="Alasan penolakan..."
          ></textarea>
          <div class="flex gap-3">
            <button 
              class="btn-outline flex-1"
              (click)="showRejectModal = false"
            >
              Batal
            </button>
            <button 
              class="btn-danger flex-1"
              (click)="reject()"
              [disabled]="!rejectionReason || isProcessing()"
            >
              Tolak Pengajuan
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .btn-danger {
      @apply bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all;
    }
    .btn-success {
      @apply bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all;
    }
  `]
})
export class LoanDetailComponent implements OnInit {
  private loanService = inject(LoanService);
  private tokenService = inject(TokenService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  readonly LoanStatus = LoanStatus;

  loan = signal<LoanApplication | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(true);
  isLoadingProfile = signal(false);
  isProcessing = signal(false);

  ktpImageUrl = signal<string | null>(null);
  showKtpPreview = false;
  showRejectModal = false;

  actionNotes = '';
  rejectionReason = '';

  ngOnInit(): void {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoan(Number(loanId));
    }
  }

  loadLoan(id: number): void {
    this.isLoading.set(true);
    this.loanService.getLoanById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.loan.set(response.data);
          console.log('Loan data:', response.data);
          
          const loanData = response.data as any;
          
          // Get userId from loan response (backend now provides this field)
          const userId = loanData.userId;
          
          if (userId) {
            console.log('Loading profile for userId:', userId);
            this.loadUserProfile(userId);
          } else {
            console.warn('userId not found in loan response');
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading loan:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadUserProfile(userId: number): void {
    this.isLoadingProfile.set(true);
    
    // Call GET /api/users/{userId}/profile
    this.http.get<ApiResponse<UserProfile>>(`${environment.apiUrl}/users/${userId}/profile`).subscribe({
      next: (response) => {
        console.log('User profile response:', response);
        if (response.success && response.data) {
          this.userProfile.set(response.data);
          
          // Load KTP image using userId (with auth header)
          if (response.data.hasKtpUploaded) {
            this.loadKtpImage(userId);
          }
        }
        this.isLoadingProfile.set(false);
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.isLoadingProfile.set(false);
      }
    });
  }

  loadKtpImage(userId: number): void {
    const ktpUrl = `${environment.apiUrl}/profile/${userId}/ktp`;
    console.log('Fetching KTP from:', ktpUrl);
    
    // Fetch image as blob using HttpClient (includes auth header via interceptor)
    this.http.get(ktpUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Convert blob to data URL for img src
        const reader = new FileReader();
        reader.onloadend = () => {
          this.ktpImageUrl.set(reader.result as string);
          console.log('KTP image loaded successfully');
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error loading KTP image:', err);
        this.ktpImageUrl.set(null);
      }
    });
  }

  onKtpImageError(event: any): void {
    console.error('KTP image display error');
    this.ktpImageUrl.set(null);
  }

  goBack(): void {
    this.router.navigate(['/admin/loans']);
  }

  hasLocation(): boolean {
    const loan = this.loan();
    return !!(loan?.latitude && loan?.longitude);
  }

  getMapUrl(): SafeResourceUrl {
    const loan = this.loan();
    if (!loan || !loan.latitude || !loan.longitude) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
    // Simple Google Maps Embed
    const url = `https://maps.google.com/maps?q=${loan.latitude},${loan.longitude}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getPlafondName(): string {
    const loanData = this.loan() as any;
    return loanData?.plafond?.name || loanData?.plafondName || 'N/A';
  }

  getTenorValue(): number {
    const loanData = this.loan() as any;
    return loanData?.tenorMonth || loanData?.tenor || 0;
  }

  getInterestRate(): string {
    const loanData = this.loan() as any;
    // Check for interestRate (percentage) or calculate from totalInterest
    if (loanData?.interestRate) {
      return loanData.interestRate.toFixed(2);
    }
    // If totalInterest is available, calculate percentage
    if (loanData?.totalInterest && loanData?.amount) {
      const rate = (loanData.totalInterest / loanData.amount) * 100;
      return rate.toFixed(2);
    }
    // Check plafond for interest rate
    if (loanData?.plafond?.interestRate) {
      return loanData.plafond.interestRate.toFixed(2);
    }
    return '0';
  }

  canTakeAction(): boolean {
    const loanData = this.loan();
    if (!loanData) return false;
    return this.canReview() || this.canApprove() || this.canDisburse();
  }

  canReview(): boolean {
    const loanData = this.loan();
    if (!loanData) return false;
    const status = loanData.status;
    const isValidStatus = status === LoanStatus.SUBMITTED || status === LoanStatus.IN_REVIEW;
    return isValidStatus && (this.isMarketing() || this.isSuperAdmin());
  }

  canApprove(): boolean {
    const loanData = this.loan();
    if (!loanData) return false;
    const status = String(loanData.status).toUpperCase();
    const canApprove = (status === 'REVIEWED' || status === 'IN_REVIEW') && (this.isBranchManager() || this.isSuperAdmin());
    console.log('canApprove check:', { status, isBM: this.isBranchManager(), isSA: this.isSuperAdmin(), result: canApprove });
    return canApprove;
  }

  canDisburse(): boolean {
    const loanData = this.loan();
    if (!loanData) return false;
    const status = String(loanData.status).toUpperCase();
    const canDisburse = status === 'APPROVED' && (this.isBackOffice() || this.isSuperAdmin());
    console.log('canDisburse check:', { status, isBO: this.isBackOffice(), isSA: this.isSuperAdmin(), result: canDisburse });
    return canDisburse;
  }

  startReview(): void {
    const loanData = this.loan();
    if (!loanData) return;

    this.isProcessing.set(true);
    // Use submitReview with APPROVED status to simulate "Start Review" or just update status if needed.
    // However, based on the requirement, start-review endpoint is replaced by the general review endpoint.
    // If "Start Review" just meant changing status to IN_REVIEW locally or on backend, we might need to verify if backend supports that.
    // But usually for this flow we can just skip to complete review or use the review endpoint.
    // Let's assume we proceed to complete review or just open the notes section.
    // For now, let's just show a toast that review mode is active since we don't have a specific start-review endpoint anymore
    // or we can treat it as part of the flow. 
    // Actually, looking at the UI, "Start Review" button changes status to IN_REVIEW. 
    // If the backend doesn't have an endpoint for this, we might just update valid status locally or skip valid status update 
    // until we submit the final review. 
    // Let's just update local state to allow entering notes.
    loanData.status = LoanStatus.IN_REVIEW; // Local update to show review UI
    this.loan.set({...loanData}); // Trigger signal update
    this.isProcessing.set(false);
  }

  completeReview(): void {
    const loanData = this.loan();
    if (!loanData) {
      console.error('No loan data available');
      return;
    }

    // Use default notes if empty
    const notes = this.actionNotes?.trim() || 'Review selesai, data lengkap';
    
    console.log('Submitting review for loan:', loanData.id, 'with notes:', notes);
    
    this.isProcessing.set(true);
    this.loanService.submitReview(loanData.id, 'APPROVED', notes).subscribe({
      next: (response) => {
        console.log('Review success:', response);
        this.toastService.success('Review selesai! Pengajuan diteruskan ke Branch Manager.');
        this.goBack();
      },
      error: (err) => {
        console.error('Review error:', err);
        this.toastService.error('Gagal menyelesaikan review: ' + (err.error?.message || err.message || 'Unknown error'));
        this.isProcessing.set(false);
      }
    });
  }

  approve(): void {
    const loanData = this.loan();
    if (!loanData) return;

    this.isProcessing.set(true);
    this.loanService.submitApproval(loanData.id, 'APPROVED', this.actionNotes || 'Disetujui').subscribe({
      next: () => {
        this.toastService.success('Pengajuan disetujui! Diteruskan ke Back Office untuk pencairan.');
        this.goBack();
      },
      error: (err) => {
        console.error('Approval error:', err);
        this.toastService.error('Gagal menyetujui pengajuan');
        this.isProcessing.set(false);
      }
    });
  }

  reject(): void {
    const loanData = this.loan();
    if (!loanData || !this.rejectionReason) return;

    this.isProcessing.set(true);
    // Combine notes and rejection reason if needed, or just use reason as note
    const note = this.actionNotes ? `${this.actionNotes}. Reason: ${this.rejectionReason}` : this.rejectionReason;
    
    this.loanService.submitApproval(loanData.id, 'REJECTED', note).subscribe({
      next: () => {
        this.toastService.success('Pengajuan ditolak.');
        this.showRejectModal = false;
        this.goBack();
      },
      error: (err) => {
        console.error('Reject error:', err);
        this.toastService.error('Gagal menolak pengajuan');
        this.isProcessing.set(false);
      }
    });
  }

  disburse(): void {
    const loanData = this.loan();
    if (!loanData) return;

    this.isProcessing.set(true);
    this.loanService.processDisbursement(loanData.id).subscribe({
      next: () => {
        this.toastService.success('Dana berhasil dicairkan!');
        this.goBack();
      },
      error: (err) => {
        console.error('Disbursement error:', err);
        this.toastService.error('Gagal mencairkan dana');
        this.isProcessing.set(false);
      }
    });
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
