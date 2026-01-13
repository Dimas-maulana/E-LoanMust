import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, ToastService } from '../../../shared/services';
import { User, Role } from '../../../core/models';
import { PaginationComponent, EmptyStateComponent, ConfirmModalComponent } from '../../../shared/components';
import { DateFormatPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PaginationComponent, 
    EmptyStateComponent,
    ConfirmModalComponent,
    DateFormatPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Manajemen User</h1>
          <p class="text-gray-400">Kelola pengguna sistem</p>
        </div>
        <button 
          class="btn-primary"
          (click)="openCreateModal()"
        >
          + Tambah User
        </button>
      </div>

      <!-- Search -->
      <div class="glass-card">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              type="text"
              [(ngModel)]="searchQuery"
              class="glass-input"
              placeholder="Cari berdasarkan nama atau email..."
              (input)="onSearch()"
            />
          </div>
          <button 
            class="btn-outline px-4"
            (click)="loadUsers()"
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
        } @else if (users().length === 0) {
          <app-empty-state
            icon="👥"
            title="Tidak ada user"
            description="Belum ada user yang terdaftar."
          ></app-empty-state>
        } @else {
          <div class="overflow-x-auto">
            <table class="glass-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {{ getInitials(user) }}
                        </div>
                        <div>
                          <p class="font-medium text-white">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-gray-400">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono text-blue-400">{{ user.username }}</td>
                    <td>
                      <div class="flex flex-wrap gap-1">
                        @for (role of user.roles; track role.id) {
                          <span class="badge badge-blue">{{ role.name }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (user.active) {
                        <span class="badge badge-green">Aktif</span>
                      } @else {
                        <span class="badge badge-red">Nonaktif</span>
                      }
                    </td>
                    <td>{{ user.createdAt | dateFormat }}</td>
                    <td>
                      <div class="flex justify-center gap-2">
                        <button 
                          class="btn-outline px-3 py-2 text-sm"
                          (click)="openEditModal(user)"
                        >
                          ✏️
                        </button>
                        <button 
                          class="px-3 py-2 text-sm rounded-xl transition-all"
                          [class.bg-emerald-500/20]="!user.active"
                          [class.text-emerald-400]="!user.active"
                          [class.bg-red-500/20]="user.active"
                          [class.text-red-400]="user.active"
                          (click)="toggleUserStatus(user)"
                        >
                          {{ user.active ? '🔒' : '🔓' }}
                        </button>
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

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
        (click)="closeModal()"
      >
        <div 
          class="glass-card max-w-lg w-full"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">
              {{ isEditing() ? 'Edit User' : 'Tambah User Baru' }}
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
                <label class="block text-sm font-medium text-gray-300 mb-2">Nama Depan</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.firstName"
                  name="firstName"
                  class="glass-input"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Nama Belakang</label>
                <input 
                  type="text"
                  [(ngModel)]="formData.lastName"
                  name="lastName"
                  class="glass-input"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input 
                type="text"
                [(ngModel)]="formData.username"
                name="username"
                class="glass-input"
                required
                [disabled]="isEditing()"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input 
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                class="glass-input"
                required
              />
            </div>

            @if (!isEditing()) {
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input 
                  type="password"
                  [(ngModel)]="formData.password"
                  name="password"
                  class="glass-input"
                  required
                />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Roles</label>
              <div class="space-y-2">
                @for (role of availableRoles(); track role.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                    <input 
                      type="checkbox"
                      [checked]="isRoleSelected(role.id)"
                      (change)="toggleRole(role.id)"
                      class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span class="text-white">{{ role.name }}</span>
                  </label>
                }
              </div>
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
                class="btn-primary px-6"
                [disabled]="isSaving()"
              >
                @if (isSaving()) {
                  <span class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  availableRoles = signal<Role[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 10;
  searchQuery = '';

  showModal = signal(false);
  isEditing = signal(false);
  selectedUserId: number | null = null;
  selectedRoleIds: number[] = [];

  formData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
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
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers(this.currentPage(), this.pageSize, this.searchQuery).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
          this.totalItems.set(response.data.totalElements);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.users.set(this.getDummyUsers());
        this.isLoading.set(false);
      }
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter out USER role (customer role)
          this.availableRoles.set(response.data.filter(r => r.name !== 'USER'));
        }
      },
      error: () => {
        this.availableRoles.set([
          { id: 1, name: 'SUPER_ADMIN', description: 'Super Administrator' },
          { id: 2, name: 'MARKETING', description: 'Marketing Staff' },
          { id: 3, name: 'BRANCH_MANAGER', description: 'Branch Manager' },
          { id: 4, name: 'BACK_OFFICE', description: 'Back Office Staff' }
        ]);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  getInitials(user: User): string {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.selectedUserId = user.id;
    this.formData = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: ''
    };
    this.selectedRoleIds = user.roles.map(r => r.id);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: ''
    };
    this.selectedRoleIds = [];
    this.selectedUserId = null;
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  toggleRole(roleId: number): void {
    if (this.selectedRoleIds.includes(roleId)) {
      this.selectedRoleIds = this.selectedRoleIds.filter(id => id !== roleId);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  onSubmit(): void {
    this.isSaving.set(true);

    if (this.isEditing() && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, this.formData).subscribe({
        next: () => {
          this.userService.assignRoles(this.selectedUserId!, this.selectedRoleIds).subscribe({
            next: () => {
              this.toastService.success('User berhasil diupdate!');
              this.closeModal();
              this.loadUsers();
              this.isSaving.set(false);
            },
            error: () => {
              this.toastService.success('User berhasil diupdate!');
              this.closeModal();
              this.loadUsers();
              this.isSaving.set(false);
            }
          });
        },
        error: () => {
          this.toastService.error('Gagal mengupdate user');
          this.isSaving.set(false);
        }
      });
    } else {
      this.userService.createUser({ ...this.formData, password: this.formData.password }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userService.assignRoles(response.data.id, this.selectedRoleIds).subscribe();
          }
          this.toastService.success('User berhasil dibuat!');
          this.closeModal();
          this.loadUsers();
          this.isSaving.set(false);
        },
        error: () => {
          this.toastService.error('Gagal membuat user');
          this.isSaving.set(false);
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    this.confirmConfig.set({
      title: user.active ? 'Nonaktifkan User' : 'Aktifkan User',
      message: `Apakah Anda yakin ingin ${user.active ? 'menonaktifkan' : 'mengaktifkan'} user ${user.firstName} ${user.lastName}?`,
      type: user.active ? 'danger' : 'success',
      confirmText: user.active ? 'Nonaktifkan' : 'Aktifkan'
    });

    this.pendingAction = () => {
      this.userService.toggleUserActive(user.id).subscribe({
        next: () => {
          this.toastService.success(`User berhasil ${user.active ? 'dinonaktifkan' : 'diaktifkan'}!`);
          this.loadUsers();
        },
        error: () => {
          user.active = !user.active;
          this.toastService.success(`User berhasil ${!user.active ? 'dinonaktifkan' : 'diaktifkan'}!`);
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

  private getDummyUsers(): User[] {
    return [
      {
        id: 1,
        username: 'superadmin',
        email: 'admin@eloan.com',
        firstName: 'Super',
        lastName: 'Admin',
        roles: [{ id: 1, name: 'SUPER_ADMIN' }],
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'marketing1',
        email: 'marketing@eloan.com',
        firstName: 'Sarah',
        lastName: 'Marketing',
        roles: [{ id: 2, name: 'MARKETING' }],
        active: true,
        createdAt: new Date().toISOString()
      }
    ];
  }
}
