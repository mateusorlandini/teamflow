import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tf-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div class="forgot">
      @if (!submitted()) {
        <div class="forgot__header">
          <h2 class="forgot__title">Reset your password</h2>
          <p class="forgot__subtitle">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="forgot__form">
          <mat-form-field appearance="outline">
            <mat-label>Email address</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@teamflow.io" />
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>
          <button mat-flat-button color="primary" class="forgot__submit" type="submit" [disabled]="form.invalid">
            Send reset link
          </button>
        </form>
      } @else {
        <div class="forgot__success">
          <div class="forgot__success-icon">
            <mat-icon>mark_email_read</mat-icon>
          </div>
          <h3>Check your inbox</h3>
          <p>
            We sent a password reset link to <strong>{{ form.get('email')?.value }}</strong>.
            This is a demo — no real email was sent.
          </p>
        </div>
      }
      <div class="forgot__back">
        <a routerLink="/auth/login">
          <mat-icon>arrow_back</mat-icon> Back to sign in
        </a>
      </div>
    </div>
  `,
  styles: [`
    .forgot {
      display: flex;
      flex-direction: column;
      gap: 24px;

      &__header { text-align: center; }
      &__title { font-size: 26px; font-weight: 700; color: var(--tf-text-primary); margin: 0 0 6px; letter-spacing: -0.5px; }
      &__subtitle { font-size: 14px; color: var(--tf-text-secondary); margin: 0; line-height: 1.6; }

      &__form { display: flex; flex-direction: column; gap: 12px; mat-form-field { width: 100%; } }
      &__submit { height: 44px !important; font-size: 15px !important; font-weight: 600 !important; width: 100%; border-radius: var(--tf-radius-md) !important; background: var(--tf-primary-600) !important; }

      &__success {
        text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
        &-icon { width: 72px; height: 72px; border-radius: 50%; background: var(--tf-success-50); display: flex; align-items: center; justify-content: center;
          mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--tf-success-500); }
        }
        h3 { font-size: 20px; font-weight: 700; color: var(--tf-text-primary); margin: 0; }
        p { font-size: 14px; color: var(--tf-text-secondary); margin: 0; line-height: 1.6; }
      }

      &__back {
        text-align: center;
        a { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--tf-text-secondary); font-weight: 500;
          mat-icon { font-size: 16px; width: 16px; height: 16px; }
          &:hover { color: var(--tf-primary-600); text-decoration: none; }
        }
      }
    }
  `],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  readonly submitted = signal(false);

  readonly form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitted.set(true);
  }
}
