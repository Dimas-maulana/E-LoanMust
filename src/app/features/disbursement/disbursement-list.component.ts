import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, ToastService } from '../../shared/services';
import { LoanApplication, LoanStatus } from '../../core/models';
import { StatusBadgeComponent, PaginationComponent, EmptyStateComponent, ConfirmModalComponent } from '../../shared/components';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';

@Component({
  selector: 'app-disbursement-list',
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
          <h1 class="text-2xl font-bold text-white">Pencairan Dana</h1>
          <p class="text-gray-400">Daftar pinjaman yang siap dicairkan</p>
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
          <button 
            class="btn-outline px-4"
            (click)="loadLoans()"
          >
            🔄 Refresh
          </button>
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
            icon="💰"
            title="Tidak ada pinjaman"
            description="Belum ada pinjaman yang siap dicairkan."
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
                  <th>Approved By</th>
                  <th>Tgl Approval</th>
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
                        <p class="font-medium text-white">{{ loan.customer.fullName }}</p>
                        <p class="text-xs text-gray-400">{{ loan.customer.email }}</p>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-gold">{{ loan.plafond.name }}</span>
                    </td>
                    <td class="font-semibold text-white">{{ loan.amount | currency }}</td>
                    <td>
                      @if (loan.approvedBy) {
                        <p class="text-white">{{ loan.approvedBy.firstName }}</p>
                      } @else {
                        <span class="text-gray-500">-</span>
                      }
                    </td>
                    <td>{{ loan.approvedAt | dateFormat }}</td>
                    <td>
                      <app-status-badge [status]="loan.status"></app-status-badge>
                    </td>
                    <td class="text-center">
                      <button 
                        class="btn-gold px-3 py-2 text-sm"
                        (click)="openDisbursement(loan)"
                      >
                        💰 Cairkan
                      </button>
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

    <!-- Disbursement Modal -->
    @if (selectedLoan()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
        (click)="closeDisbursement()"
      >
        <div 
          class="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-white">Konfirmasi Pencairan</h2>
              <p class="text-gray-400">{{ selectedLoan()!.applicationNumber }}</p>
            </div>
            <button 
              class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              (click)="closeDisbursement()"
            >
              ✕
            </button>
          </div>

          <!-- Loan Summary -->
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-400 text-sm">Customer</p>
                <p class="text-white font-semibold">{{ selectedLoan()!.customer.fullName }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Jumlah Pinjaman</p>
                <p class="text-emerald-400 font-bold text-xl">{{ selectedLoan()!.amount | currency }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Tenor</p>
                <p class="text-white">{{ selectedLoan()!.tenor }} Bulan</p>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Cicilan/Bulan</p>
                <p class="text-white">{{ selectedLoan()!.monthlyInstallment | currency }}</p>
              </div>
            </div>
          </div>

          <!-- Approval Notes -->
          @if (selectedLoan()!.approvalNotes) {
            <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
              <h4 class="font-semibold text-blue-400 mb-2">Catatan Approval</h4>
              <p class="text-gray-300">{{ selectedLoan()!.approvalNotes }}</p>
            </div>
          }

          <!-- Disbursement Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Jumlah Pencairan</label>
              <input 
                type="number"
                [(ngModel)]="disbursementAmount"
                class="glass-input"
                [placeholder]="'Rp ' + selectedLoan()!.amount"
              />
              <p class="text-xs text-gray-400 mt-1">
                Jumlah yang akan ditransfer ke rekening customer
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tanggal Pencairan</label>
              <input 
                type="date"
                [(ngModel)]="disbursementDate"
                class="glass-input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Catatan (Opsional)</label>
              <textarea 
                [(ngModel)]="disbursementNotes"
                class="glass-textarea w-full"
                rows="3"
                placeholder="Catatan tambahan..."
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
            <button 
              class="btn-outline px-6"
              (click)="closeDisbursement()"
            >
              Batal
            </button>
            <button 
              class="btn-gold px-6"
              (click)="confirmDisbursement()"
              [disabled]="!disbursementAmount || !disbursementDate"
            >
              💰 Konfirmasi Pencairan
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Confirm Modal -->
    <app-confirm-modal
      [isOpen]="showConfirmModal()"
      title="Konfirmasi Pencairan Dana"
      [message]="'Apakah Anda yakin ingin mencairkan dana sebesar ' + (disbursementAmount | currency) + ' untuk pengajuan ' + (selectedLoan()?.applicationNumber || '') + '?'"
      type="success"
      confirmText="Ya, Cairkan"
      (confirm)="processDisbursement()"
      (cancel)="showConfirmModal.set(false)"
    ></app-confirm-modal>
  `
})
export class DisbursementListComponent implements OnInit {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  readonly LoanStatus = LoanStatus;

  loans = signal<LoanApplication[]>([]);
  isLoading = signal(true);
  selectedLoan = signal<LoanApplication | null>(null);
  
  disbursementAmount: number = 0;
  disbursementDate: string = '';
  disbursementNotes: string = '';

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 10;

  searchQuery = '';

  showConfirmModal = signal(false);

  ngOnInit(): void {
    this.loadLoans();
    this.disbursementDate = new Date().toISOString().split('T')[0];
  }

  loadLoans(): void {
    this.isLoading.set(true);
    
    this.loanService.getLoansForDisbursement(this.currentPage(), this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.loans.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
          this.totalItems.set(response.data.totalElements);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.loans.set(this.getDummyLoans());
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

  openDisbursement(loan: LoanApplication): void {
    this.selectedLoan.set(loan);
    this.disbursementAmount = loan.amount;
    this.disbursementDate = new Date().toISOString().split('T')[0];
    this.disbursementNotes = '';
  }

  closeDisbursement(): void {
    this.selectedLoan.set(null);
    this.disbursementAmount = 0;
    this.disbursementNotes = '';
  }

  confirmDisbursement(): void {
    this.showConfirmModal.set(true);
  }

  processDisbursement(): void {
    const loan = this.selectedLoan();
    if (!loan) return;

    this.showConfirmModal.set(false);

    this.loanService.processDisbursement(loan.id).subscribe({
      next: () => {
        this.toastService.success('Dana berhasil dicairkan!');
        this.closeDisbursement();
        this.loadLoans();
      },
      error: (err) => {
        console.error('Disbursement error:', err);
        this.toastService.error('Gagal mencairkan dana');
        this.closeDisbursement();
      }
    });
  }

  private getDummyLoans(): LoanApplication[] {
    return [
      {
        id: 4,
        applicationNumber: 'LN-2024-0004',
        customer: {
          id: 4,
          userId: 4,
          fullName: 'Dewi Lestari',
          email: 'dewi@email.com',
          phone: '084567890123',
          nik: '3201234567890004'
        },
        plafond: {
          id: 3,
          name: 'Platinum',
          code: 'PLATINUM',
          minAmount: 50000000,
          maxAmount: 200000000,
          minTenor: 12,
          maxTenor: 36,
          interestRate: 8,
          active: true
        },
        amount: 100000000,
        tenor: 24,
        interestRate: 8,
        monthlyInstallment: 4500000,
        totalPayment: 108000000,
        status: LoanStatus.APPROVED,
        approvedBy: {
          id: 6,
          username: 'branchmanager1',
          email: 'bm@eloan.com',
          firstName: 'Rudi',
          lastName: 'Manager',
          roles: [],
          active: true
        },
        approvedAt: new Date().toISOString(),
        approvalNotes: 'Semua dokumen lengkap dan valid. Approved.',
        createdAt: new Date().toISOString()
      }
    ];
  }
}
