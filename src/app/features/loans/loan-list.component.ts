import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoanService, ToastService } from '../../shared/services';
import { TokenService } from '../../core/auth';
import { LoanApplication, LoanStatus, AdminRole } from '../../core/models';
import { StatusBadgeComponent, PaginationComponent, EmptyStateComponent } from '../../shared/components';
import { CurrencyPipe, DateFormatPipe } from '../../shared/pipes';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    PaginationComponent,
    EmptyStateComponent,
    CurrencyPipe,
    DateFormatPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Loan Application</h1>
          <p class="text-gray-400">{{ getSubtitle() }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Role:</span>
          <span class="badge badge-blue">{{ currentRoleName() }}</span>
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
            @if (isSuperAdmin()) {
              <select 
                [(ngModel)]="statusFilter"
                class="glass-select w-48"
                (change)="loadLoans()"
              >
                <option value="">Semua Status</option>
                <option value="PENDING_REVIEW">Menunggu Review</option>
                <option value="REVIEWED">Sudah Review</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
                <option value="DISBURSED">Sudah Dicairkan</option>
              </select>
            }
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
            [description]="getEmptyDescription()"
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
                @for (loan of loans(); track loan.id; let i = $index) {
                  <tr class="cursor-pointer hover:bg-white/5" (click)="viewDetail(loan)">
                    <td class="font-mono text-blue-400">{{ getRowNumber(i) }}</td>
                    <td>
                      <div>
                        <p class="font-medium text-white">{{ getCustomerName(loan) }}</p>
                        <p class="text-xs text-gray-400">{{ getCustomerEmail(loan) }}</p>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-gold">{{ getPlafondName(loan) }}</span>
                    </td>
                    <td class="font-semibold text-white">{{ loan.amount | currency }}</td>
                    <td>{{ getTenorDisplay(loan) }}</td>
                    <td>{{ loan.createdAt | dateFormat }}</td>
                    <td>
                      <app-status-badge [status]="loan.status"></app-status-badge>
                    </td>
                    <td class="text-center" (click)="$event.stopPropagation()">
                      <div class="flex justify-center gap-2">
                        <button 
                          class="btn-outline px-3 py-2 text-sm"
                          (click)="viewDetail(loan)"
                        >
                          Detail
                        </button>
                        @if (canTakeAction(loan)) {
                          <button 
                            class="btn-primary px-3 py-2 text-sm"
                            (click)="takeAction(loan)"
                          >
                            {{ getActionLabel(loan) }}
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

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-card text-center py-4">
          <p class="text-2xl font-bold text-white">{{ loans().length }}</p>
          <p class="text-sm text-gray-400">Ditampilkan</p>
        </div>
        <div class="glass-card text-center py-4">
          <p class="text-2xl font-bold text-blue-400">{{ totalItems() }}</p>
          <p class="text-sm text-gray-400">Total Data</p>
        </div>
        <div class="glass-card text-center py-4">
          <p class="text-2xl font-bold text-emerald-400">{{ getTotalAmount() | currency }}</p>
          <p class="text-sm text-gray-400">Total Nominal</p>
        </div>
        <div class="glass-card text-center py-4">
          <p class="text-2xl font-bold text-amber-400">{{ currentPage() + 1 }}/{{ totalPages() || 1 }}</p>
          <p class="text-sm text-gray-400">Halaman</p>
        </div>
      </div>
    </div>
  `
})
export class LoanListComponent implements OnInit {
  private loanService = inject(LoanService);
  private tokenService = inject(TokenService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly LoanStatus = LoanStatus;

  loans = signal<LoanApplication[]>([]);
  allLoans = signal<LoanApplication[]>([]);
  isLoading = signal(true);

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 10;

  searchQuery = '';
  statusFilter = '';

  currentRoleName = computed(() => {
    if (this.isSuperAdmin()) return 'Super Admin';
    if (this.isMarketing()) return 'Marketing';
    if (this.isBranchManager()) return 'Branch Manager';
    if (this.isBackOffice()) return 'Back Office';
    return 'Admin';
  });

  ngOnInit(): void {
    // Check for status filter in query params
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.statusFilter = params['status'];
      }
      this.loadLoans();
    });
  }

  loadLoans(): void {
    this.isLoading.set(true);

    if (this.isSuperAdmin()) {
      this.loadAllLoans();
    } else if (this.isMarketing()) {
      this.loadMarketingLoans();
    } else if (this.isBranchManager()) {
      this.loadBranchManagerLoans();
    } else if (this.isBackOffice()) {
      this.loadBackOfficeLoans();
    }
  }

  private loadAllLoans(): void {
    // Super Admin sees all loans
    this.loanService.getAllLoansForAdmin().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let loans = response.data;
          
          // Apply status filter
          if (this.statusFilter) {
            loans = loans.filter((l: any) => l.status === this.statusFilter);
          }
          
          // Apply search filter
          if (this.searchQuery) {
            loans = this.applySearchFilter(loans);
          }
          
          this.paginateLoans(loans);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading loans:', err);
        this.loans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private loadMarketingLoans(): void {
    // Marketing sees PENDING_REVIEW / SUBMITTED loans
    this.loanService.getPendingReviewLoans().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let loans = response.data;
          if (this.searchQuery) {
            loans = this.applySearchFilter(loans);
          }
          this.paginateLoans(loans);
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

  private loadBranchManagerLoans(): void {
    // Branch Manager sees REVIEWED loans (pending approval)
    this.loanService.getPendingApprovalLoans().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let loans = response.data;
          if (this.searchQuery) {
            loans = this.applySearchFilter(loans);
          }
          this.paginateLoans(loans);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending approvals:', err);
        this.loans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private loadBackOfficeLoans(): void {
    // Back Office sees APPROVED loans (pending disbursement)
    this.loanService.getPendingDisbursementLoans().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          let loans = response.data;
          if (this.searchQuery) {
            loans = this.applySearchFilter(loans);
          }
          this.paginateLoans(loans);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending disbursements:', err);
        this.loans.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private applySearchFilter(loans: any[]): any[] {
    const query = this.searchQuery.toLowerCase();
    return loans.filter((loan: any) =>
      loan.applicationNumber?.toLowerCase().includes(query) ||
      loan.customer?.fullName?.toLowerCase().includes(query) ||
      loan.customerName?.toLowerCase().includes(query) ||
      loan.customer?.email?.toLowerCase().includes(query) ||
      loan.customerEmail?.toLowerCase().includes(query)
    );
  }

  private paginateLoans(loans: any[]): void {
    this.allLoans.set(loans);
    const totalLoans = loans.length;
    const startIndex = this.currentPage() * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedLoans = loans.slice(startIndex, endIndex);

    this.loans.set(paginatedLoans);
    this.totalItems.set(totalLoans);
    this.totalPages.set(Math.ceil(totalLoans / this.pageSize));
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadLoans();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    // Re-paginate from cached data
    const loans = this.allLoans();
    this.paginateLoans(loans);
  }

  viewDetail(loan: LoanApplication): void {
    this.router.navigate(['/admin/loans', loan.id]);
  }

  takeAction(loan: LoanApplication): void {
    this.router.navigate(['/admin/loans', loan.id], { queryParams: { action: true } });
  }

  canTakeAction(loan: LoanApplication): boolean {
    const status = loan.status;
    if (this.isSuperAdmin()) {
      return status !== LoanStatus.DISBURSED && status !== LoanStatus.REJECTED;
    }
    if (this.isMarketing()) {
      return status === LoanStatus.SUBMITTED || status === LoanStatus.IN_REVIEW;
    }
    if (this.isBranchManager()) {
      return status === LoanStatus.REVIEWED;
    }
    if (this.isBackOffice()) {
      return status === LoanStatus.APPROVED;
    }
    return false;
  }

  getActionLabel(loan: LoanApplication): string {
    const status = loan.status;
    if (this.isMarketing() || (this.isSuperAdmin() && (status === LoanStatus.SUBMITTED || status === LoanStatus.IN_REVIEW))) {
      return status === LoanStatus.SUBMITTED ? 'Mulai Review' : 'Selesai Review';
    }
    if (this.isBranchManager() || (this.isSuperAdmin() && status === LoanStatus.REVIEWED)) {
      return 'Approve/Reject';
    }
    if (this.isBackOffice() || (this.isSuperAdmin() && status === LoanStatus.APPROVED)) {
      return 'Cairkan';
    }
    return 'Proses';
  }

  getSubtitle(): string {
    if (this.isSuperAdmin()) return 'Semua pengajuan pinjaman dari customer';
    if (this.isMarketing()) return 'Pengajuan yang perlu direview';
    if (this.isBranchManager()) return 'Pengajuan yang perlu diapprove';
    if (this.isBackOffice()) return 'Pengajuan yang siap dicairkan';
    return 'Daftar pengajuan pinjaman';
  }

  getEmptyDescription(): string {
    if (this.isMarketing()) return 'Belum ada pengajuan baru yang perlu direview.';
    if (this.isBranchManager()) return 'Belum ada pengajuan yang menunggu approval.';
    if (this.isBackOffice()) return 'Belum ada pengajuan yang siap dicairkan.';
    return 'Belum ada data pengajuan.';
  }

  getCustomerName(loan: any): string {
    return loan.customer?.fullName || loan.customerName || 'N/A';
  }

  getCustomerEmail(loan: any): string {
    return loan.customer?.email || loan.customerEmail || '-';
  }

  getPlafondName(loan: any): string {
    return loan.plafond?.name || loan.plafondName || 'N/A';
  }

  getTotalAmount(): number {
    return this.allLoans().reduce((sum, loan) => sum + (loan.amount || 0), 0);
  }

  getRowNumber(index: number): number {
    return (this.currentPage() * this.pageSize) + index + 1;
  }

  getTenorDisplay(loan: any): string {
    const tenor = loan.tenorMonth || loan.tenor || 0;
    return tenor > 0 ? `${tenor} Bulan` : '-';
  }

  isSuperAdmin(): boolean {
    return this.tokenService.hasRole(AdminRole.SUPER_ADMIN);
  }

  isMarketing(): boolean {
    return this.tokenService.hasRole(AdminRole.MARKETING) && !this.isSuperAdmin();
  }

  isBranchManager(): boolean {
    return this.tokenService.hasRole(AdminRole.BRANCH_MANAGER) && !this.isSuperAdmin();
  }

  isBackOffice(): boolean {
    return this.tokenService.hasRole(AdminRole.BACK_OFFICE) && !this.isSuperAdmin();
  }
}
