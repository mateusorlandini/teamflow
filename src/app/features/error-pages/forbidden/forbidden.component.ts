import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tf-forbidden',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="error-page">
      <div class="error-page__content">
        <div class="error-page__code">403</div>
        <h1 class="error-page__title">Access Denied</h1>
        <p class="error-page__desc">
          You don't have permission to access this page. Contact your administrator if you think this is a mistake.
        </p>
        <div class="error-page__actions">
          <a mat-flat-button color="primary" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Go to Dashboard
          </a>
          <a mat-stroked-button routerLink="/profile">
            <mat-icon>manage_accounts</mat-icon>
            My Profile
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrl: '../error-pages.scss',
})
export class ForbiddenComponent {}
