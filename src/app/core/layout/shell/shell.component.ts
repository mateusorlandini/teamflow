import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from "../topbar/topbar.component";
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <tf-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="toggleSidebar()"
      />
      <div class="shell__main">
        <tf-topbar (toggleSidebar)="toggleSidebar()" />
        <main class="shell__content" role="main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  readonly themeService = inject(ThemeService);

  readonly sidebarCollapsed = signal(false);

  ngOnInit(): void {
    this.notificationService.loadNotifications().subscribe();
    const stored = localStorage.getItem('tf_sidebar_collapsed');
    if (stored === 'true') this.sidebarCollapsed.set(true);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    localStorage.setItem('tf_sidebar_collapsed', String(this.sidebarCollapsed()));
  }
}
