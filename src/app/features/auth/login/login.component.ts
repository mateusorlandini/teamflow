import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'tf-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="login">
      <div class="login__header">
        <h2 class="login__title">Welcome back</h2>
        <p class="login__subtitle">Sign in to your TeamFlow account</p>
      </div>

      <div class="login__demo-accounts">
        <p class="login__demo-label">Quick access — Demo accounts:</p>
        <div class="login__demo-list">
          @for (account of demoAccounts; track account.email) {
            <button
              class="login__demo-btn"
              type="button"
              (click)="fillDemo(account.email, account.password)"
            >
              <span class="login__demo-role">{{ account.role }}</span>
              <span class="login__demo-email">{{ account.email }}</span>
            </button>
          }
        </div>
      </div>

      <mat-divider />

      <form class="login__form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="login__field">
          <mat-label>Email address</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="you@teamflow.io"
            autocomplete="email"
          />
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Enter a valid email address</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="login__field">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input
            matInput
            [type]="showPassword ? 'text' : 'password'"
            formControlName="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="showPassword = !showPassword"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
          >
            <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <mat-error>Password is required</mat-error>
          }
          @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
            <mat-error>Password must be at least 6 characters</mat-error>
          }
        </mat-form-field>

        <div class="login__forgot">
          <a routerLink="/auth/forgot-password">Forgot your password?</a>
        </div>

        @if (auth.authError()) {
          <div class="login__error" role="alert">
            <mat-icon>error_outline</mat-icon>
            <span>{{ auth.authError() }}</span>
          </div>
        }

        <button
          mat-flat-button
          color="primary"
          class="login__submit"
          type="submit"
          [disabled]="form.invalid || auth.isLoading()"
        >
          @if (auth.isLoading()) {
            <mat-spinner diameter="20" />
          } @else {
            Sign in
          }
        </button>
      </form>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showPassword = false;

  readonly demoAccounts = [
    { role: 'Admin', email: 'admin@teamflow.io', password: 'admin123' },
    { role: 'Manager', email: 'manager@teamflow.io', password: 'manager123' },
    { role: 'Member', email: 'member@teamflow.io', password: 'member123' },
  ];

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  fillDemo(email: string, password: string): void {
    this.form.setValue({ email, password });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}
