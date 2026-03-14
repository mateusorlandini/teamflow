import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationType, NOTIFICATION_TYPE_ICONS } from '../../../domain/enums/notification-type.enum';

@Component({
  selector: 'tf-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <header class="topbar" role="banner">
      <div class="topbar__left">
        <button
          class="topbar__menu-btn"
          (click)="toggleSidebar.emit()"
          aria-label="Toggle navigation"
          mat-icon-button
        >
          <mat-icon>menu</mat-icon>
        </button>
      </div>

      <div class="topbar__right">
        <button
          mat-icon-button
          class="topbar__action-btn"
          [matTooltip]="themeService.isDarkActive() ? 'Switch to light mode' : 'Switch to dark mode'"
          (click)="themeService.toggleDarkMode()"
          aria-label="Toggle theme"
        >
          <mat-icon>{{ themeService.isDarkActive() ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <button
          mat-icon-button
          class="topbar__action-btn"
          [matMenuTriggerFor]="notifMenu"
          aria-label="Notifications"
          [matBadge]="notifService.unreadCount()"
          [matBadgeHidden]="!notifService.hasUnread()"
          matBadgeColor="warn"
          matBadgeSize="small"
        >
          <mat-icon>notifications</mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" class="notif-menu" xPosition="before">
          <div class="notif-panel" (click)="$event.stopPropagation()">
            <div class="notif-panel__header">
              <span class="notif-panel__title">Notifications</span>
              @if (notifService.hasUnread()) {
                <button mat-button class="notif-panel__mark-all" (click)="notifService.markAllAsRead()">
                  Mark all read
                </button>
              }
            </div>
            <mat-divider />
            <div class="notif-panel__list">
              @if (notifService.notifications().length === 0) {
                <div class="notif-panel__empty">
                  <mat-icon>notifications_none</mat-icon>
                  <span>All caught up!</span>
                </div>
              }
              @for (n of notifService.notifications().slice(0, 8); track n.id) {
                <div
                  class="notif-item"
                  [class.notif-item--unread]="!n.isRead"
                  (click)="onNotifClick(n.id, n.resourceId)"
                  role="button"
                  tabindex="0"
                >
                  <div class="notif-item__icon">
                    <mat-icon>{{ getNotifIcon(n.type) }}</mat-icon>
                  </div>
                  <div class="notif-item__body">
                    <p class="notif-item__title">{{ n.title }}</p>
                    <p class="notif-item__message">{{ n.message }}</p>
                    <span class="notif-item__time">{{ formatTime(n.createdAt) }}</span>
                  </div>
                  @if (!n.isRead) {
                    <div class="notif-item__dot" aria-label="Unread"></div>
                  }
                </div>
              }
            </div>
          </div>
        </mat-menu>

        <button
          mat-icon-button
          class="topbar__action-btn"
          [matMenuTriggerFor]="userMenu"
          aria-label="User menu"
        >
          @if (auth.currentUser(); as user) {
            <img class="topbar__avatar" [src]="user.avatar" [alt]="user.name" />
          }
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          @if (auth.currentUser(); as user) {
            <div class="user-menu-header">
              <img class="user-menu-avatar" [src]="user.avatar" [alt]="user.name" />
              <div>
                <p class="user-menu-name">{{ user.name }}</p>
                <p class="user-menu-email">{{ user.email }}</p>
              </div>
            </div>
            <mat-divider />
          }
          <button mat-menu-item routerLink="/profile">
            <mat-icon>manage_accounts</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider />
          <button mat-menu-item (click)="auth.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Log out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly auth = inject(AuthService);
  readonly notifService = inject(NotificationService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  getNotifIcon(type: NotificationType): string {
    return NOTIFICATION_TYPE_ICONS[type] ?? 'notifications';
  }

  onNotifClick(notifId: string, resourceId: string | null): void {
    this.notifService.markAsRead(notifId).subscribe();
    if (resourceId) {
      this.router.navigate(['/tasks', resourceId]);
    }
  }

  formatTime(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
