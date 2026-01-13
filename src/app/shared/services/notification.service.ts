import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, switchMap, startWith } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Notification,
  NotificationCount,
  ApiResponse,
  PageResponse
} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all notifications for current user
  getNotifications(page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<Notification>>> {
    return this.http.get<ApiResponse<PageResponse<Notification>>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Get unread notifications
  getUnreadNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/unread`);
  }

  // Get notification count
  getNotificationCount(): Observable<ApiResponse<NotificationCount>> {
    return this.http.get<ApiResponse<NotificationCount>>(`${this.apiUrl}/count`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.unreadCountSubject.next(response.data.unread);
        }
      })
    );
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<ApiResponse<Notification>> {
    return this.http.patch<ApiResponse<Notification>>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${notificationId}`);
  }

  // Start polling for new notifications (every 30 seconds)
  startPolling(intervalMs: number = 30000): Observable<ApiResponse<NotificationCount>> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getNotificationCount())
    );
  }

  // Update unread count
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
