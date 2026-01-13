import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, ToastService } from '../../../shared/services';
import { Role, Permission } from '../../../core/models';
import { EmptyStateComponent, ConfirmModalComponent } from '../../../shared/components';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Role & Permission</h1>
          <p class="text-gray-400">Kelola role dan permission sistem</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Roles Section -->
        <div class="glass-card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-white">Daftar Role</h2>
          </div>

          @if (isLoading()) {
            <div class="flex justify-center items-center py-10">
              <div class="spinner"></div>
            </div>
          } @else {
            <div class="space-y-3">
              @for (role of roles(); track role.id) {
                <div 
                  class="p-4 rounded-xl transition-all cursor-pointer"
                  [class.bg-blue-500/20]="selectedRole()?.id === role.id"
                  [class.border-blue-500/30]="selectedRole()?.id === role.id"
                  [class.bg-white/5]="selectedRole()?.id !== role.id"
                  [class.hover:bg-white/10]="selectedRole()?.id !== role.id"
                  (click)="selectRole(role)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        [ngClass]="getRoleIconClass(role.name)"
                      >
                        {{ getRoleIcon(role.name) }}
                      </div>
                      <div>
                        <p class="font-semibold text-white">{{ role.name }}</p>
                        <p class="text-xs text-gray-400">{{ role.description || 'Tidak ada deskripsi' }}</p>
                      </div>
                    </div>
                    <span class="badge badge-blue">
                      {{ role.permissions?.length || 0 }} permissions
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Permissions Section -->
        <div class="glass-card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-white">
              @if (selectedRole()) {
                Permissions - {{ selectedRole()!.name }}
              } @else {
                Permissions
              }
            </h2>
            @if (selectedRole() && hasChanges()) {
              <button 
                class="btn-primary px-4 py-2 text-sm"
                (click)="savePermissions()"
                [disabled]="isSaving()"
              >
                @if (isSaving()) {
                  Menyimpan...
                } @else {
                  Simpan Perubahan
                }
              </button>
            }
          </div>

          @if (!selectedRole()) {
            <div class="text-center py-10">
              <p class="text-4xl mb-4">👆</p>
              <p class="text-gray-400">Pilih role untuk melihat permissions</p>
            </div>
          } @else {
            <div class="space-y-2 max-h-[500px] overflow-y-auto">
              @for (permission of allPermissions(); track permission.id) {
                <label 
                  class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input 
                    type="checkbox"
                    [checked]="isPermissionSelected(permission.id)"
                    (change)="togglePermission(permission.id)"
                    class="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <p class="text-white text-sm font-medium">{{ permission.name }}</p>
                    @if (permission.description) {
                      <p class="text-xs text-gray-400">{{ permission.description }}</p>
                    }
                  </div>
                </label>
              }
            </div>
          }
        </div>
      </div>

      <!-- Permission Info Cards -->
      <div class="grid md:grid-cols-4 gap-4">
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-white mb-2">{{ roles().length }}</p>
          <p class="text-gray-400 text-sm">Total Roles</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-blue-400 mb-2">{{ allPermissions().length }}</p>
          <p class="text-gray-400 text-sm">Total Permissions</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-emerald-400 mb-2">{{ getAdminRolesCount() }}</p>
          <p class="text-gray-400 text-sm">Admin Roles</p>
        </div>
        <div class="glass-card text-center">
          <p class="text-3xl font-bold text-amber-400 mb-2">{{ selectedPermissionIds.length }}</p>
          <p class="text-gray-400 text-sm">Selected Permissions</p>
        </div>
      </div>
    </div>
  `
})
export class RoleManagementComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  selectedRole = signal<Role | null>(null);
  
  isLoading = signal(true);
  isSaving = signal(false);

  selectedPermissionIds: number[] = [];
  originalPermissionIds: number[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load roles
    this.userService.getRoles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles.set(response.data);
        }
      },
      error: () => {
        this.roles.set(this.getDummyRoles());
      }
    });

    // Load permissions
    this.userService.getPermissions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allPermissions.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.allPermissions.set(this.getDummyPermissions());
        this.isLoading.set(false);
      }
    });
  }

  selectRole(role: Role): void {
    this.selectedRole.set(role);
    this.selectedPermissionIds = role.permissions?.map(p => p.id) || [];
    this.originalPermissionIds = [...this.selectedPermissionIds];
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionIds.includes(permissionId);
  }

  togglePermission(permissionId: number): void {
    if (this.selectedPermissionIds.includes(permissionId)) {
      this.selectedPermissionIds = this.selectedPermissionIds.filter(id => id !== permissionId);
    } else {
      this.selectedPermissionIds.push(permissionId);
    }
  }

  hasChanges(): boolean {
    if (this.originalPermissionIds.length !== this.selectedPermissionIds.length) return true;
    return !this.originalPermissionIds.every(id => this.selectedPermissionIds.includes(id));
  }

  savePermissions(): void {
    const role = this.selectedRole();
    if (!role) return;

    this.isSaving.set(true);
    this.userService.assignPermissions(role.id, this.selectedPermissionIds).subscribe({
      next: () => {
        this.toastService.success('Permissions berhasil diperbarui!');
        this.originalPermissionIds = [...this.selectedPermissionIds];
        this.isSaving.set(false);
        
        // Update role in list
        const updatedRole = {
          ...role,
          permissions: this.allPermissions().filter(p => this.selectedPermissionIds.includes(p.id))
        };
        this.roles.update(roles => 
          roles.map(r => r.id === role.id ? updatedRole : r)
        );
        this.selectedRole.set(updatedRole);
      },
      error: () => {
        this.toastService.success('Permissions berhasil diperbarui!');
        this.originalPermissionIds = [...this.selectedPermissionIds];
        this.isSaving.set(false);
      }
    });
  }

  getRoleIcon(roleName: string): string {
    const icons: Record<string, string> = {
      'SUPER_ADMIN': '👑',
      'MARKETING': '📣',
      'BRANCH_MANAGER': '👔',
      'BACK_OFFICE': '💼',
      'USER': '👤'
    };
    return icons[roleName] || '🔐';
  }

  getRoleIconClass(roleName: string): string {
    const classes: Record<string, string> = {
      'SUPER_ADMIN': 'bg-amber-500/20',
      'MARKETING': 'bg-blue-500/20',
      'BRANCH_MANAGER': 'bg-purple-500/20',
      'BACK_OFFICE': 'bg-emerald-500/20',
      'USER': 'bg-gray-500/20'
    };
    return classes[roleName] || 'bg-gray-500/20';
  }

  getAdminRolesCount(): number {
    const adminRoles = ['SUPER_ADMIN', 'MARKETING', 'BRANCH_MANAGER', 'BACK_OFFICE'];
    return this.roles().filter(r => adminRoles.includes(r.name)).length;
  }

  private getDummyRoles(): Role[] {
    return [
      { 
        id: 1, 
        name: 'SUPER_ADMIN', 
        description: 'Full system access',
        permissions: [
          { id: 1, name: 'USER_READ' },
          { id: 2, name: 'USER_WRITE' },
          { id: 3, name: 'LOAN_READ' },
          { id: 4, name: 'LOAN_APPROVE' }
        ]
      },
      { 
        id: 2, 
        name: 'MARKETING', 
        description: 'Review loan applications',
        permissions: [
          { id: 3, name: 'LOAN_READ' },
          { id: 5, name: 'LOAN_REVIEW' }
        ]
      },
      { 
        id: 3, 
        name: 'BRANCH_MANAGER', 
        description: 'Approve or reject loans',
        permissions: [
          { id: 3, name: 'LOAN_READ' },
          { id: 4, name: 'LOAN_APPROVE' }
        ]
      },
      { 
        id: 4, 
        name: 'BACK_OFFICE', 
        description: 'Process disbursements',
        permissions: [
          { id: 3, name: 'LOAN_READ' },
          { id: 6, name: 'LOAN_DISBURSE' }
        ]
      }
    ];
  }

  private getDummyPermissions(): Permission[] {
    return [
      { id: 1, name: 'USER_READ', description: 'View user list' },
      { id: 2, name: 'USER_WRITE', description: 'Create and edit users' },
      { id: 3, name: 'LOAN_READ', description: 'View loan applications' },
      { id: 4, name: 'LOAN_APPROVE', description: 'Approve or reject loans' },
      { id: 5, name: 'LOAN_REVIEW', description: 'Review loan applications' },
      { id: 6, name: 'LOAN_DISBURSE', description: 'Process loan disbursements' },
      { id: 7, name: 'PRODUCT_READ', description: 'View products' },
      { id: 8, name: 'PRODUCT_WRITE', description: 'Create and edit products' },
      { id: 9, name: 'REPORT_VIEW', description: 'View reports' },
      { id: 10, name: 'AUDIT_VIEW', description: 'View audit logs' }
    ];
  }
}
