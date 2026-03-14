import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tf-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__brand">
        <div class="auth-layout__brand-inner">
          <div class="auth-layout__logo">
            <mat-icon>workspaces</mat-icon>
          </div>
          <h1 class="auth-layout__name">TeamFlow</h1>
          <p class="auth-layout__tagline">
            The modern platform for high-performing engineering teams.
          </p>
          <div class="auth-layout__features">
            <div class="auth-layout__feature">
              <mat-icon>view_kanban</mat-icon>
              <span>Visual Kanban boards</span>
            </div>
            <div class="auth-layout__feature">
              <mat-icon>insights</mat-icon>
              <span>Real-time productivity analytics</span>
            </div>
            <div class="auth-layout__feature">
              <mat-icon>group</mat-icon>
              <span>Multi-team collaboration</span>
            </div>
            <div class="auth-layout__feature">
              <mat-icon>task_alt</mat-icon>
              <span>Smart task management</span>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-layout__form">
        <div class="auth-layout__form-inner">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
