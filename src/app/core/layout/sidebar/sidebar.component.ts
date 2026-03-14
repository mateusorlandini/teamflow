import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../auth/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'tf-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed" role="navigation" aria-label="Main navigation">
      <div class="sidebar__header">
        <div class="sidebar__logo">
          <div class="sidebar__logo-icon">
            <mat-icon>workspaces</mat-icon>
          </div>
          @if (!collapsed) {
            <span class="sidebar__logo-text">TeamFlow</span>
          }
        </div>
        <button
          class="sidebar__toggle"
          (click)="toggleCollapse.emit()"
          [matTooltip]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          matTooltipPosition="right"
          aria-label="Toggle sidebar"
        >
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <nav class="sidebar__nav">
        <div class="sidebar__section-label" *ngIf="!collapsed">MAIN</div>

        @for (item of mainNavItems; track item.route) {
          @if (canSee(item)) {
            <a
              class="sidebar__nav-item"
              [routerLink]="item.route"
              routerLinkActive="sidebar__nav-item--active"
              [matTooltip]="collapsed ? item.label : ''"
              matTooltipPosition="right"
              [attr.aria-label]="item.label"
            >
              <mat-icon class="sidebar__nav-icon">{{ item.icon }}</mat-icon>
              @if (!collapsed) {
                <span class="sidebar__nav-label">{{ item.label }}</span>
              }
            </a>
          }
        }

        <div class="sidebar__divider"></div>
        <div class="sidebar__section-label" *ngIf="!collapsed">WORKSPACE</div>

        @for (item of workspaceNavItems; track item.route) {
          @if (canSee(item)) {
            <a
              class="sidebar__nav-item"
              [routerLink]="item.route"
              routerLinkActive="sidebar__nav-item--active"
              [matTooltip]="collapsed ? item.label : ''"
              matTooltipPosition="right"
              [attr.aria-label]="item.label"
            >
              <mat-icon class="sidebar__nav-icon">{{ item.icon }}</mat-icon>
              @if (!collapsed) {
                <span class="sidebar__nav-label">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__divider"></div>
        @for (item of bottomNavItems; track item.route) {
          <a
            class="sidebar__nav-item"
            [routerLink]="item.route"
            routerLinkActive="sidebar__nav-item--active"
            [matTooltip]="collapsed ? item.label : ''"
            matTooltipPosition="right"
            [attr.aria-label]="item.label"
          >
            <mat-icon class="sidebar__nav-icon">{{ item.icon }}</mat-icon>
            @if (!collapsed) {
              <span class="sidebar__nav-label">{{ item.label }}</span>
            }
          </a>
        }

        <div class="sidebar__user" *ngIf="auth.currentUser() as user">
          <img
            class="sidebar__user-avatar"
            [src]="user.avatar"
            [alt]="user.name"
            loading="lazy"
          />
          @if (!collapsed) {
            <div class="sidebar__user-info">
              <span class="sidebar__user-name">{{ user.name }}</span>
              <span class="sidebar__user-role">{{ user.role | titlecase }}</span>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly auth = inject(AuthService);

  readonly mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'My Tasks', icon: 'task_alt', route: '/tasks' },
    { label: 'Kanban Board', icon: 'view_kanban', route: '/kanban' },
  ];

  readonly workspaceNavItems: NavItem[] = [
    { label: 'Teams', icon: 'group', route: '/teams' },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      roles: ['admin', 'manager'],
    },
  ];

  readonly bottomNavItems: NavItem[] = [
    { label: 'Profile', icon: 'manage_accounts', route: '/profile' },
  ];

  canSee(item: NavItem): boolean {
    if (!item.roles) return true;
    const role = this.auth.currentUser()?.role;
    return role ? item.roles.includes(role) : false;
  }
}
