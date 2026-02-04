import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, ToastService } from '../../shared/services';
import { LoanApplication, LoanStatus } from '../../core/models';
import { StatusBadgeComponent, PaginationComponent, EmptyStateComponent, ConfirmModalComponent } from '../../shared/components';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';

@Component({
  selector: 'app-approval-list',
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
          <h1 class="text-2xl font-bold text-white">Approval Pinjaman</h1>
          <p class="text-gray-400">Daftar pinjaman yang menunggu approval</p>
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
            icon="✅"
            title="Tidak ada pengajuan"
            description="Belum ada pengajuan pinjaman yang menunggu approval."
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
                  <th>Reviewed By</th>
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
                    <td>{{ loan.tenor }} Bulan</td>
                    <td>
                      @if (loan.reviewedBy) {
                        <div>
                          <p class="text-white">{{ loan.reviewedBy.firstName }}</p>
                          <p class="text-xs text-gray-400">{{ loan.reviewedAt | dateFormat }}</p>
                        </div>
                      } @else {
                        <span class="text-gray-500">-</span>
                      }
                    </td>
                    <td>
                      <app-status-badge [status]="loan.status"></app-status-badge>
                    </td>
                    <td class="text-center">
                      <button 
                        class="btn-primary px-3 py-2 text-sm"
                        (click)="viewDetail(loan)"
                      >
                        Review & Approve
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

          <!-- Marketing Review Notes -->
          @if (selectedLoan()!.reviewNotes) {
            <div class="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <h4 class="font-semibold text-blue-400 mb-2">Catatan Review (Marketing)</h4>
              <p class="text-gray-300">{{ selectedLoan()!.reviewNotes }}</p>
              @if (selectedLoan()!.reviewedBy) {
                <p class="text-xs text-gray-400 mt-2">
                  Oleh: {{ selectedLoan()!.reviewedBy!.firstName }} - {{ selectedLoan()!.reviewedAt | dateFormat:'datetime' }}
                </p>
              }
            </div>
          }

          <!-- Approval Section -->
          <div class="mt-6 pt-6 border-t border-white/10">
            <h3 class="font-semibold text-white mb-4">Keputusan Approval</h3>
            
            <!-- Decision Type -->
            <div class="flex gap-4 mb-4">
              <button 
                class="flex-1 p-4 rounded-xl border-2 transition-all"
                [class.border-emerald-500]="approvalDecision === 'approve'"
                [class.bg-emerald-500/10]="approvalDecision === 'approve'"
                [class.border-white/10]="approvalDecision !== 'approve'"
                (click)="approvalDecision = 'approve'"
              >
                <div class="flex items-center justify-center gap-3">
                  <span class="text-2xl">✅</span>
                  <span class="text-white font-semibold">Setujui</span>
                </div>
              </button>
              <button 
                class="flex-1 p-4 rounded-xl border-2 transition-all"
                [class.border-red-500]="approvalDecision === 'reject'"
                [class.bg-red-500/10]="approvalDecision === 'reject'"
                [class.border-white/10]="approvalDecision !== 'reject'"
                (click)="approvalDecision = 'reject'"
              >
                <div class="flex items-center justify-center gap-3">
                  <span class="text-2xl">❌</span>
                  <span class="text-white font-semibold">Tolak</span>
                </div>
              </button>
            </div>

            <!-- Notes -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                {{ approvalDecision === 'reject' ? 'Alasan Penolakan' : 'Catatan Approval' }}
              </label>
              <textarea 
                [(ngModel)]="approvalNotes"
                class="glass-textarea w-full"
                rows="4"
                [placeholder]="approvalDecision === 'reject' ? 'Jelaskan alasan penolakan...' : 'Catatan tambahan (opsional)...'"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button 
                class="btn-outline px-6"
                (click)="closeDetail()"
              >
                Batal
              </button>
              @if (approvalDecision === 'approve') {
                <button 
                  class="btn-success px-6"
                  (click)="submitApproval(true)"
                >
                  Setujui Pinjaman
                </button>
              } @else if (approvalDecision === 'reject') {
                <button 
                  class="btn-danger px-6"
                  (click)="submitApproval(false)"
                  [disabled]="!approvalNotes"
                >
                  Tolak Pinjaman
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Confirm Modal -->
    <app-confirm-modal
      [isOpen]="showConfirmModal()"
      [title]="confirmModalConfig().title"
      [message]="confirmModalConfig().message"
      [type]="confirmModalConfig().type"
      [confirmText]="confirmModalConfig().confirmText"
      (confirm)="onConfirm()"
      (cancel)="showConfirmModal.set(false)"
    ></app-confirm-modal>
  `
})
export class ApprovalListComponent implements OnInit {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  readonly LoanStatus = LoanStatus;

  loans = signal<LoanApplication[]>([]);
  isLoading = signal(true);
  selectedLoan = signal<LoanApplication | null>(null);
  
  approvalDecision: 'approve' | 'reject' | null = null;
  approvalNotes = '';

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 10;

  searchQuery = '';

  showConfirmModal = signal(false);
  confirmModalConfig = signal<{
    title: string;
    message: string;
    type: 'success' | 'danger' | 'warning' | 'info';
    confirmText: string;
  }>({
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Ya'
  });
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading.set(true);
    
    this.loanService.getLoansForApproval(this.currentPage(), this.pageSize).subscribe({
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

  viewDetail(loan: LoanApplication): void {
    this.selectedLoan.set(loan);
    this.approvalDecision = null;
    this.approvalNotes = '';
  }

  closeDetail(): void {
    this.selectedLoan.set(null);
    this.approvalDecision = null;
    this.approvalNotes = '';
  }

  submitApproval(approved: boolean): void {
    const loan = this.selectedLoan();
    if (!loan) return;

    if (approved) {
      this.confirmModalConfig.set({
        title: 'Konfirmasi Approval',
        message: `Apakah Anda yakin ingin menyetujui pengajuan pinjaman ${loan.applicationNumber}?`,
        type: 'success',
        confirmText: 'Ya, Setujui'
      });
    } else {
      this.confirmModalConfig.set({
        title: 'Konfirmasi Penolakan',
        message: `Apakah Anda yakin ingin menolak pengajuan pinjaman ${loan.applicationNumber}?`,
        type: 'danger',
        confirmText: 'Ya, Tolak'
      });
    }

    this.pendingAction = () => {
      // Use new submitApproval method
      const status = approved ? 'APPROVED' : 'REJECTED';
      // For rejection, combine notes and reason
      const note = approved ? this.approvalNotes : (this.approvalNotes ? `${this.approvalNotes}` : 'Ditolak');

      this.loanService.submitApproval(loan.id, status, note).subscribe({
        next: () => {
          this.toastService.success(approved ? 'Pinjaman berhasil disetujui!' : 'Pinjaman ditolak.');
          this.closeDetail();
          this.loadLoans();
        },
        error: (err) => {
          console.error('Approval error:', err);
          this.toastService.error('Gagal memproses approval');
          this.closeDetail();
        }
      });
    };

    this.showConfirmModal.set(true);
  }

  onConfirm(): void {
    this.showConfirmModal.set(false);
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  private getDummyLoans(): LoanApplication[] {
    return [
      {
        id: 1,
        applicationNumber: 'LN-2024-0003',
        customer: {
          id: 3,
          userId: 3,
          fullName: 'Budi Santoso',
          email: 'budi@email.com',
          phone: '083456789012',
          nik: '3201234567890003'
        },
        plafond: {
          id: 2,
          name: 'Gold',
          code: 'GOLD',
          minAmount: 10000000,
          maxAmount: 50000000,
          minTenor: 6,
          maxTenor: 24,
          interestRate: 10,
          active: true
        },
        amount: 30000000,
        tenor: 18,
        interestRate: 10,
        monthlyInstallment: 1833333,
        totalPayment: 33000000,
        status: LoanStatus.REVIEWED,
        reviewedBy: {
          id: 5,
          username: 'marketing1',
          email: 'marketing@eloan.com',
          firstName: 'Sarah',
          lastName: 'Marketing',
          roles: [],
          active: true
        },
        reviewedAt: new Date().toISOString(),
        reviewNotes: 'Data customer lengkap dan valid. Penghasilan sesuai dengan slip gaji. Layak untuk disetujui.',
        createdAt: new Date().toISOString()
      }
    ];
  }
}
