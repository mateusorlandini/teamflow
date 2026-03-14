import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Notification } from '../../domain/models/notification.model';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _notifications = signal<Notification[]>([]);
  private readonly _isLoading = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.isRead).length,
  );

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  loadNotifications(): Observable<Notification[]> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return new Observable();

    this._isLoading.set(true);
    return this.http
      .get<Notification[]>(`${environment.apiUrl}/notifications?recipientId=${userId}`)
      .pipe(
        tap((notifs) => {
          const sorted = [...notifs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          this._notifications.set(sorted);
          this._isLoading.set(false);
        }),
      );
  }

  markAsRead(id: string): Observable<Notification> {
    const readAt = new Date().toISOString();
    return this.http
      .patch<Notification>(`${environment.apiUrl}/notifications/${id}`, {
        isRead: true,
        readAt,
      })
      .pipe(
        tap(() => {
          this._notifications.update((notifs) =>
            notifs.map((n) => (n.id === id ? { ...n, isRead: true, readAt } : n)),
          );
        }),
      );
  }

  markAllAsRead(): void {
    const unread = this._notifications().filter((n) => !n.isRead);
    unread.forEach((n) => this.markAsRead(n.id).subscribe());
  }

  addLocal(notification: Notification): void {
    this._notifications.update((notifs) => [notification, ...notifs]);
  }
}
