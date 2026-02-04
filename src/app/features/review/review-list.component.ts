import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanService, ToastService } from '../../shared/services';
import { LoanApplication, LoanStatus } from '../../core/models';
import { StatusBadgeComponent, PaginationComponent, EmptyStateComponent, ConfirmModalComponent } from '../../shared/components';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    PaginationComponent, 
    EmptyStateComponent,
    ConfirmModalComponent,
    CurrencyPipe, 
    DateFormatPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Review Pengajuan Pinjaman</h1>
          <p class="text-gray-400">Daftar pengajuan pinjaman yang perlu direview</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              type="text"
              [(ngModel)]="searchQuery"
              class="glass-input"
              placeholder="Cari berdasarkan nama customer atau nomor pengajuan..."
              (input)="onSearch()"
            />
          </div>
          <div class="flex gap-2">
            <select 
              [(ngModel)]="statusFilter"
              class="glass-select w-40"
              (change)="loadLoans()"
            >
              <option value="">Semua Status</option>
              <option [value]="LoanStatus.SUBMITTED">Diajukan</option>
              <option [value]="LoanStatus.IN_REVIEW">Sedang Review</option>
            </select>
            <button 
              class="btn-outline px-4"
              (click)="loadLoans()"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-card overflow-hidden p-0">
        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="spinner"></div>
          </div>
        } @else if (loans().length === 0) {
          <app-empty-state
            icon="📋"
            title="Tidak ada pengajuan"
            description="Belum ada pengajuan pinjaman yang perlu direview."
          ></app-empty-state>
        } @else {
          <div class="overflow-x-auto">
            <table class="glass-table">
              <thead>
                <tr>
                  <th>No. Pengajuan</th>
                  <th>Customer</th>
                  <th>Produk</th>
                  <th>Jumlah</th>
                  <th>Tenor</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                @for (loan of loans(); track loan.id) {
                  <tr>
                    <td class="font-mono text-blue-400">{{ loan.applicationNumber }}</td>
                    <td>
                      <div>
                        <p class="font-medium text-white">{{ loan.customer?.fullName || $any(loan).customerName || 'N/A' }}</p>
                        <p class="text-xs text-gray-400">{{ loan.customer?.email || $any(loan).customerEmail || '-' }}</p>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-gold">{{ loan.plafond?.name || $any(loan).plafondName || 'N/A' }}</span>
                    </td>
                    <td class="font-semibold text-white">{{ loan.amount | currency }}</td>
                    <td>{{ loan.tenor }} Bulan</td>
                    <td>{{ loan.createdAt | dateFormat }}</td>
                    <td>
                      <app-status-badge [status]="loan.status"></app-status-badge>
                    </td>
                    <td class="text-center">
                      <div class="flex justify-center gap-2">
                        @if (loan.status === LoanStatus.SUBMITTED) {
                          <button 
                            class="btn-primary px-3 py-2 text-sm"
                            (click)="startReview(loan)"
                          >
                            Mulai Review
                          </button>
                        } @else {
                          <button 
                            class="btn-outline px-3 py-2 text-sm"
                            (click)="viewDetail(loan)"
                          >
                            Detail
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="p-4 border-t border-white/10">
            <app-pagination
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              [totalItems]="totalItems()"
              [pageSize]="pageSize"
              (pageChange)="onPageChange($event)"
            ></app-pagination>
          </div>
        }
      </div>
    </div>

    <!-- Detail Modal -->
    @if (selectedLoan()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
        (click)="closeDetail()"
      >
        <div 
          class="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-white">Detail Pengajuan</h2>
              <p class="text-gray-400">{{ selectedLoan()!.applicationNumber }}</p>
            </div>
            <button 
              class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              (click)="closeDetail()"
            >
              ✕
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- Customer Info -->
            <div class="space-y-4">
              <h3 class="font-semibold text-white border-b border-white/10 pb-2">Informasi Customer</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-400">Nama Lengkap</span>
                  <span class="text-white">{{ selectedLoan()!.customer.fullName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Email</span>
                  <span class="text-white">{{ selectedLoan()!.customer.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">No. Telepon</span>
                  <span class="text-white">{{ selectedLoan()!.customer.phone }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">NIK</span>
                  <span class="text-white font-mono">{{ selectedLoan()!.customer.nik }}</span>
                </div>
              </div>
            </div>

            <!-- Loan Info -->
            <div class="space-y-4">
              <h3 class="font-semibold text-white border-b border-white/10 pb-2">Informasi Pinjaman</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-400">Produk</span>
                  <span class="badge badge-gold">{{ selectedLoan()!.plafond.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Jumlah Pinjaman</span>
                  <span class="text-white font-semibold">{{ selectedLoan()!.amount | currency }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Tenor</span>
                  <span class="text-white">{{ selectedLoan()!.tenor }} Bulan</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Bunga</span>
                  <span class="text-white">{{ selectedLoan()!.interestRate }}% / tahun</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Cicilan / Bulan</span>
                  <span class="text-emerald-400 font-semibold">{{ selectedLoan()!.monthlyInstallment | currency }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Notes -->
          @if (selectedLoan()!.status === LoanStatus.IN_REVIEW || selectedLoan()!.status === LoanStatus.SUBMITTED) {
            <div class="mt-6 pt-6 border-t border-white/10">
              <h3 class="font-semibold text-white mb-4">Catatan Review</h3>
              <textarea 
                [(ngModel)]="reviewNotes"
                class="glass-textarea w-full"
                rows="4"
                placeholder="Masukkan catatan review..."
              ></textarea>

              <div class="flex justify-end gap-3 mt-4">
                <button 
                  class="btn-outline px-6"
                  (click)="closeDetail()"
                >
                  Batal
                </button>
                <button 
                  class="btn-success px-6"
                  (click)="completeReview()"
                >
                  Selesai Review
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ReviewListComponent implements OnInit {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly LoanStatus = LoanStatus;

  loans = signal<LoanApplication[]>([]);
  isLoading = signal(true);
  selectedLoan = signal<LoanApplication | null>(null);
  reviewNotes = '';

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 10;

  searchQuery = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading.set(true);
    
    // Use /api/reviews/pending endpoint for Marketing review list
    this.loanService.getPendingReviewLoans().subscribe({
      next: (response) => {
        console.log('Pending Review Response:', response);
        if (response.success && response.data) {
          // Backend returns array, handle pagination on frontend
          let allLoans = response.data;
          console.log('All Loans from API:', allLoans);
          console.log('First loan sample:', allLoans[0]);
          
          // Apply search filter if any
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            allLoans = allLoans.filter((loan: any) =>
              loan.applicationNumber?.toLowerCase().includes(query) ||
              loan.customer?.fullName?.toLowerCase().includes(query) ||
              loan.customerName?.toLowerCase().includes(query) ||
              loan.customer?.email?.toLowerCase().includes(query) ||
              loan.customerEmail?.toLowerCase().includes(query)
            );
          }
          
          // Apply status filter if any
          if (this.statusFilter) {
            allLoans = allLoans.filter((loan: any) => loan.status === this.statusFilter);
          }
          
          // Frontend pagination
          const totalLoans = allLoans.length;
          const startIndex = this.currentPage() * this.pageSize;
          const endIndex = startIndex + this.pageSize;
          const paginatedLoans = allLoans.slice(startIndex, endIndex);
          
          console.log('Total loans:', totalLoans);
          console.log('Paginated loans:', paginatedLoans);
          console.log('Setting loans to state...');
          
          this.loans.set(paginatedLoans);
          this.totalItems.set(totalLoans);
          this.totalPages.set(Math.ceil(totalLoans / this.pageSize));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending reviews:', err);
        this.loans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadLoans();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLoans();
  }

  startReview(loan: LoanApplication): void {
    // No specific endpoint for start review in new API (it's combined in submit review)
    // Just update local state to show review UI if needed or proceed to detail
    loan.status = LoanStatus.IN_REVIEW;
    this.selectedLoan.set(loan);
    this.toastService.success('Silakan isi catatan review');
  }

  viewDetail(loan: LoanApplication): void {
    this.selectedLoan.set(loan);
    this.reviewNotes = loan.reviewNotes || '';
  }

  closeDetail(): void {
    this.selectedLoan.set(null);
    this.reviewNotes = '';
  }

  completeReview(): void {
    const loan = this.selectedLoan();
    if (!loan) {
      console.error('No loan selected');
      return;
    }

    // Use default notes if empty
    const notes = this.reviewNotes?.trim() || 'Review selesai, data lengkap';
    
    console.log('Submitting review for loan:', loan.id, 'with notes:', notes);

    this.loanService.submitReview(loan.id, 'APPROVED', notes).subscribe({
      next: (response) => {
        console.log('Review success:', response);
        this.toastService.success('Review selesai! Pengajuan diteruskan ke Branch Manager.');
        this.closeDetail();
        this.loadLoans();
      },
      error: (err) => {
        console.error('Review error:', err);
        this.toastService.error('Gagal menyelesaikan review: ' + (err.error?.message || err.message || 'Unknown error'));
        this.closeDetail();
      }
    });
  }

  private getDummyLoans(): LoanApplication[] {
    return [
      {
        id: 1,
        applicationNumber: 'LN-2024-0001',
        customer: {
          id: 1,
          userId: 1,
          fullName: 'Ahmad Wijaya',
          email: 'ahmad@email.com',
          phone: '081234567890',
          nik: '3201234567890001'
        },
        plafond: {
          id: 1,
          name: 'Gold',
          code: 'GOLD',
          minAmount: 10000000,
          maxAmount: 50000000,
          minTenor: 6,
          maxTenor: 24,
          interestRate: 10,
          active: true
        },
        amount: 25000000,
        tenor: 12,
        interestRate: 10,
        monthlyInstallment: 2291667,
        totalPayment: 27500000,
        status: LoanStatus.SUBMITTED,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        applicationNumber: 'LN-2024-0002',
        customer: {
          id: 2,
          userId: 2,
          fullName: 'Siti Nurhaliza',
          email: 'siti@email.com',
          phone: '082345678901',
          nik: '3201234567890002'
        },
        plafond: {
          id: 2,
          name: 'Platinum',
          code: 'PLATINUM',
          minAmount: 50000000,
          maxAmount: 200000000,
          minTenor: 12,
          maxTenor: 36,
          interestRate: 8,
          active: true
        },
        amount: 75000000,
        tenor: 24,
        interestRate: 8,
        monthlyInstallment: 3375000,
        totalPayment: 81000000,
        status: LoanStatus.IN_REVIEW,
        createdAt: new Date().toISOString()
      }
    ];
  }
}
