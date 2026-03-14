import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tf-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="error-page">
      <div class="error-page__content">
        <div class="error-page__code">404</div>
        <h1 class="error-page__title">Page Not Found</h1>
        <p class="error-page__desc">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div class="error-page__actions">
          <a mat-flat-button color="primary" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Go to Dashboard
          </a>
          <a mat-stroked-button routerLink="/tasks">
            <mat-icon>task_alt</mat-icon>
            View Tasks
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrl: '../error-pages.scss',
})
export class NotFoundComponent {}
