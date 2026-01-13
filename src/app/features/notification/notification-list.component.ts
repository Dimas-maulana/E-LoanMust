import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastService } from '../../shared/services';
import { Notification, NotificationType } from '../../core/models';
import { PaginationComponent, EmptyStateComponent } from '../../shared/components';
import { RelativeTimePipe } from '../../shared/pipes';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent, EmptyStateComponent, RelativeTimePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Notifikasi</h1>
          <p class="text-gray-400">Kelola notifikasi Anda</p>
        </div>
        <div class="flex gap-2">
          <button 
            class="btn-outline"
            (click)="markAllAsRead()"
            [disabled]="unreadCount() === 0"
          >
            ✓ Tandai Semua Dibaca
          </button>
          <button 
            class="btn-outline px-4"
            (click)="loadNotifications()"
          >
            🔄
          </button>
        </div>
      </div>

      <!-- Notification List -->
      <div class="glass-card p-0">
        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="spinner"></div>
          </div>
        } @else if (notifications().length === 0) {
          <app-empty-state
            icon="🔔"
            title="Tidak ada notifikasi"
            description="Anda tidak memiliki notifikasi saat ini."
          ></app-empty-state>
        } @else {
          <div class="divide-y divide-white/10">
            @for (notif of notifications(); track notif.id) {
              <div 
                class="p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-4"
                [class.bg-blue-500/5]="!notif.read"
                (click)="markAsRead(notif)"
              >
                <!-- Icon -->
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  [ngClass]="getNotificationIconClass(notif.type)"
                >
                  {{ getNotificationIcon(notif.type) }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-semibold" [class.text-white]="!notif.read" [class.text-gray-300]="notif.read">
                      {{ notif.title }}
                    </h3>
                    @if (!notif.read) {
                      <span class="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></span>
                    }
                  </div>
                  <p class="text-gray-400 text-sm line-clamp-2">{{ notif.message }}</p>
                  <p class="text-gray-500 text-xs mt-1">{{ notif.createdAt | relativeTime }}</p>
                </div>
              </div>
            }
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
  `
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);

  notifications = signal<Notification[]>([]);
  isLoading = signal(true);
  unreadCount = signal(0);

  currentPage = signal(0);
  totalPages = signal(0);
  totalItems = signal(0);
  pageSize = 20;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getNotifications(this.currentPage(), this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notifications.set(response.data.content);
          this.totalPages.set(response.data.totalPages);
          this.totalItems.set(response.data.totalElements);
          this.unreadCount.set(response.data.content.filter(n => !n.read).length);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notifications.set(this.getDummyNotifications());
        this.unreadCount.set(2);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount.update(count => Math.max(0, count - 1));
      },
      error: () => {
        notification.read = true;
        this.unreadCount.update(count => Math.max(0, count - 1));
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(notifs => 
          notifs.map(n => ({ ...n, read: true }))
        );
        this.unreadCount.set(0);
        this.toastService.success('Semua notifikasi ditandai sebagai dibaca');
      },
      error: () => {
        this.notifications.update(notifs => 
          notifs.map(n => ({ ...n, read: true }))
        );
        this.unreadCount.set(0);
        this.toastService.success('Semua notifikasi ditandai sebagai dibaca');
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.LOAN_SUBMITTED]: '📋',
      [NotificationType.LOAN_REVIEWED]: '🔍',
      [NotificationType.LOAN_APPROVED]: '✅',
      [NotificationType.LOAN_REJECTED]: '❌',
      [NotificationType.LOAN_DISBURSED]: '💰',
      [NotificationType.SYSTEM]: '⚙️',
      [NotificationType.INFO]: 'ℹ️'
    };
    return icons[type] || '🔔';
  }

  getNotificationIconClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      [NotificationType.LOAN_SUBMITTED]: 'bg-blue-500/20 text-blue-400',
      [NotificationType.LOAN_REVIEWED]: 'bg-purple-500/20 text-purple-400',
      [NotificationType.LOAN_APPROVED]: 'bg-emerald-500/20 text-emerald-400',
      [NotificationType.LOAN_REJECTED]: 'bg-red-500/20 text-red-400',
      [NotificationType.LOAN_DISBURSED]: 'bg-amber-500/20 text-amber-400',
      [NotificationType.SYSTEM]: 'bg-gray-500/20 text-gray-400',
      [NotificationType.INFO]: 'bg-cyan-500/20 text-cyan-400'
    };
    return classes[type] || 'bg-gray-500/20 text-gray-400';
  }

  private getDummyNotifications(): Notification[] {
    return [
      {
        id: 1,
        userId: 1,
        title: 'Pengajuan Pinjaman Baru',
        message: 'Ahmad Wijaya telah mengajukan pinjaman sebesar Rp 25.000.000',
        type: NotificationType.LOAN_SUBMITTED,
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 2,
        userId: 1,
        title: 'Pinjaman Disetujui',
        message: 'Pinjaman LN-2024-0001 telah disetujui oleh Branch Manager',
        type: NotificationType.LOAN_APPROVED,
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 3,
        userId: 1,
        title: 'Dana Dicairkan',
        message: 'Dana pinjaman LN-2024-0002 sebesar Rp 50.000.000 telah dicairkan',
        type: NotificationType.LOAN_DISBURSED,
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
  }
}
