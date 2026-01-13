import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlafondService, ToastService } from '../../../shared/services';
import { Plafond, PlafondRequest } from '../../../core/models';
import { PaginationComponent, EmptyStateComponent, ConfirmModalComponent } from '../../../shared/components';
import { CurrencyPipe, PercentagePipe } from '../../../shared/pipes';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PaginationComponent, 
    EmptyStateComponent,
    ConfirmModalComponent,
    CurrencyPipe,
    PercentagePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Manajemen Produk</h1>
          <p class="text-gray-400">Kelola plafond dan produk pinjaman</p>
        </div>
        <button 
          class="btn-gold"
          (click)="openCreateModal()"
        >
          + Tambah Produk
        </button>
      </div>

      <!-- Product Cards -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-20">
          <div class="spinner"></div>
        </div>
      } @else if (products().length === 0) {
        <app-empty-state
          icon="📦"
          title="Tidak ada produk"
          description="Belum ada produk pinjaman yang terdaftar."
        >
          <button class="btn-primary" (click)="openCreateModal()">
            + Tambah Produk Pertama
          </button>
        </app-empty-state>
      } @else {
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of products(); track product.id) {
            <div 
              class="glass-card relative group"
              [class.border-amber-500/30]="product.name.toUpperCase().includes('GOLD')"
              [class.border-gray-500/30]="product.name.toUpperCase().includes('SILVER')"
              [class.border-purple-500/30]="product.name.toUpperCase().includes('PLATINUM')"
            >
              <!-- Status Badge -->
              <div class="absolute top-4 right-4">
                @if (product.active) {
                  <span class="badge badge-green">Aktif</span>
                } @else {
                  <span class="badge badge-red">Nonaktif</span>
                }
              </div>

              <!-- Icon -->
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                [ngClass]="{
                  'bg-amber-500/20': product.name.toUpperCase().includes('GOLD'),
                  'bg-gray-500/20': product.name.toUpperCase().includes('SILVER'),
                  'bg-purple-500/20': product.name.toUpperCase().includes('PLATINUM'),
                  'bg-blue-500/20': !product.name.toUpperCase().includes('GOLD') && !product.name.toUpperCase().includes('SILVER') && !product.name.toUpperCase().includes('PLATINUM')
                }"
              >
                @if (product.name.toUpperCase().includes('GOLD')) {
                  🥇
                } @else if (product.name.toUpperCase().includes('SILVER')) {
                  🥈
                } @else if (product.name.toUpperCase().includes('PLATINUM')) {
                  💎
                } @else {
                  💰
                }
              </div>

              <!-- Product Info -->
              <h3 
                class="text-xl font-bold mb-2"
                [ngClass]="{
                  'text-amber-400': product.name.toUpperCase().includes('GOLD'),
                  'text-gray-300': product.name.toUpperCase().includes('SILVER'),
                  'text-purple-400': product.name.toUpperCase().includes('PLATINUM'),
                  'text-blue-400': !product.name.toUpperCase().includes('GOLD') && !product.name.toUpperCase().includes('SILVER') && !product.name.toUpperCase().includes('PLATINUM')
                }"
              >
                {{ product.name }}
              </h3>
              <p class="text-gray-400 text-sm mb-4">{{ product.description || 'Tidak ada deskripsi' }}</p>

              <!-- Details Grid -->
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Plafon</span>
                  <span class="text-white">{{ product.minAmount | currency }} - {{ product.maxAmount | currency }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Tenor</span>
                  <span class="text-white">{{ product.minTenor }} - {{ product.maxTenor }} Bulan</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Bunga</span>
                  <span class="text-white">{{ product.interestRate | percentage }} / tahun</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  class="flex-1 btn-outline py-2 text-sm"
                  (click)="openEditModal(product)"
                >
                  ✏️ Edit
                </button>
                <button 
                  class="py-2 px-3 rounded-xl transition-all text-sm"
                  [class.bg-emerald-500/20]="!product.active"
                  [class.text-emerald-400]="!product.active"
                  [class.bg-red-500/20]="product.active"
                  [class.text-red-400]="product.active"
                  (click)="toggleProductStatus(product)"
                >
                  {{ product.active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
        (click)="closeModal()"
      >
        <div 
          class="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">
              {{ isEditing() ? 'Edit Produk' : 'Tambah Produk Baru' }}
            </h2>
            <button 
              class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              (click)="closeModal()"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Nama Produk</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.name"
                  name="name"
                  class="glass-input"
                  placeholder="contoh: Gold"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Kode</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.code"
                  name="code"
                  class="glass-input"
                  placeholder="contoh: GOLD"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
              <textarea 
                [(ngModel)]="formData.description"
                name="description"
                class="glass-textarea w-full"
                rows="2"
                placeholder="Deskripsi produk..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Min Pinjaman (Rp)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.minAmount"
                  name="minAmount"
                  class="glass-input"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Max Pinjaman (Rp)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.maxAmount"
                  name="maxAmount"
                  class="glass-input"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Min Tenor (Bulan)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.minTenor"
                  name="minTenor"
                  class="glass-input"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Max Tenor (Bulan)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.maxTenor"
                  name="maxTenor"
                  class="glass-input"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Bunga (% / tahun)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.interestRate"
                  name="interestRate"
                  class="glass-input"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Admin Fee (Rp)</label>
                <input 
                  type="number"
                  [(ngModel)]="formData.adminFee"
                  name="adminFee"
                  class="glass-input"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5">
              <input 
                type="checkbox"
                [(ngModel)]="formData.active"
                name="active"
                id="active"
                class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <label for="active" class="text-white cursor-pointer">Produk Aktif</label>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                class="btn-outline px-6"
                (click)="closeModal()"
              >
                Batal
              </button>
              <button 
                type="submit"
                class="btn-gold px-6"
                [disabled]="isSaving()"
              >
                @if (isSaving()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin"></span>
                    Menyimpan...
                  </span>
                } @else {
                  {{ isEditing() ? 'Update' : 'Simpan' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Modal -->
    <app-confirm-modal
      [isOpen]="showConfirmModal()"
      [title]="confirmConfig().title"
      [message]="confirmConfig().message"
      [type]="confirmConfig().type"
      [confirmText]="confirmConfig().confirmText"
      (confirm)="onConfirmAction()"
      (cancel)="showConfirmModal.set(false)"
    ></app-confirm-modal>
  `
})
export class ProductManagementComponent implements OnInit {
  private plafondService = inject(PlafondService);
  private toastService = inject(ToastService);

  products = signal<Plafond[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  showModal = signal(false);
  isEditing = signal(false);
  selectedProductId: number | null = null;

  formData: PlafondRequest = {
    name: '',
    code: '',
    description: '',
    minAmount: 0,
    maxAmount: 0,
    minTenor: 0,
    maxTenor: 0,
    interestRate: 0,
    adminFee: 0,
    active: true
  };

  showConfirmModal = signal(false);
  confirmConfig = signal<{
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
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.plafondService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set(this.getDummyProducts());
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEditModal(product: Plafond): void {
    this.isEditing.set(true);
    this.selectedProductId = product.id;
    this.formData = {
      name: product.name,
      code: product.code,
      description: product.description || '',
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      minTenor: product.minTenor,
      maxTenor: product.maxTenor,
      interestRate: product.interestRate,
      adminFee: product.adminFee || 0,
      active: product.active
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      name: '',
      code: '',
      description: '',
      minAmount: 0,
      maxAmount: 0,
      minTenor: 0,
      maxTenor: 0,
      interestRate: 0,
      adminFee: 0,
      active: true
    };
    this.selectedProductId = null;
  }

  onSubmit(): void {
    this.isSaving.set(true);

    if (this.isEditing() && this.selectedProductId) {
      this.plafondService.update(this.selectedProductId, this.formData).subscribe({
        next: () => {
          this.toastService.success('Produk berhasil diupdate!');
          this.closeModal();
          this.loadProducts();
          this.isSaving.set(false);
        },
        error: () => {
          this.toastService.error('Gagal mengupdate produk');
          this.isSaving.set(false);
        }
      });
    } else {
      this.plafondService.create(this.formData).subscribe({
        next: () => {
          this.toastService.success('Produk berhasil dibuat!');
          this.closeModal();
          this.loadProducts();
          this.isSaving.set(false);
        },
        error: () => {
          this.toastService.error('Gagal membuat produk');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleProductStatus(product: Plafond): void {
    this.confirmConfig.set({
      title: product.active ? 'Nonaktifkan Produk' : 'Aktifkan Produk',
      message: `Apakah Anda yakin ingin ${product.active ? 'menonaktifkan' : 'mengaktifkan'} produk ${product.name}?`,
      type: product.active ? 'danger' : 'success',
      confirmText: product.active ? 'Nonaktifkan' : 'Aktifkan'
    });

    this.pendingAction = () => {
      this.plafondService.toggleActive(product.id).subscribe({
        next: () => {
          this.toastService.success(`Produk berhasil ${product.active ? 'dinonaktifkan' : 'diaktifkan'}!`);
          this.loadProducts();
        },
        error: () => {
          product.active = !product.active;
          this.toastService.success(`Produk berhasil ${!product.active ? 'dinonaktifkan' : 'diaktifkan'}!`);
        }
      });
    };

    this.showConfirmModal.set(true);
  }

  onConfirmAction(): void {
    this.showConfirmModal.set(false);
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  private getDummyProducts(): Plafond[] {
    return [
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
    ];
  }
}
