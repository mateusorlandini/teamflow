import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/services/auth.service';
import { UserService } from '../../data/services/user.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { UserPreferences } from '../../domain/models';

@Component({
  selector: 'tf-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    AvatarComponent,
  ],
  template: `
    <div class="tf-page-container">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">My Profile</h1>
          <p class="tf-page-subtitle">Manage your account settings and preferences</p>
        </div>
      </div>

      @if (auth.currentUser(); as user) {
        <div class="profile-layout">
          <!-- Left: Avatar card -->
          <div class="profile-avatar-card tf-card">
            <div class="profile-avatar-card__avatar">
              <tf-avatar [src]="user.avatar" [name]="user.name" size="xl" />
              <div class="profile-avatar-card__change-hint">
                <mat-icon>camera_alt</mat-icon>
              </div>
            </div>
            <h2 class="profile-avatar-card__name">{{ user.name }}</h2>
            <span class="profile-avatar-card__role">{{ user.role | titlecase }}</span>
            <span class="profile-avatar-card__email">{{ user.email }}</span>

            <mat-divider class="tf-divider" />

            <div class="profile-avatar-card__stats">
              <div class="profile-stat">
                <span class="profile-stat__value">{{ user.teamIds.length }}</span>
                <span class="profile-stat__label">Teams</span>
              </div>
              <div class="profile-stat">
                <span class="profile-stat__value profile-stat__value--success">12</span>
                <span class="profile-stat__label">Done</span>
              </div>
              <div class="profile-stat">
                <span class="profile-stat__value profile-stat__value--warn">3</span>
                <span class="profile-stat__label">Active</span>
              </div>
            </div>
          </div>

          <!-- Right: Tabs -->
          <div class="profile-tabs-panel">
            <mat-tab-group animationDuration="200ms">
              <!-- Personal Info Tab -->
              <mat-tab label="Personal Info">
                <div class="tab-content">
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Full Name</mat-label>
                        <mat-icon matPrefix>person</mat-icon>
                        <input matInput formControlName="name" />
                        @if (profileForm.get('name')?.hasError('required') && profileForm.get('name')?.touched) {
                          <mat-error>Name is required</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <mat-icon matPrefix>email</mat-icon>
                        <input matInput formControlName="email" type="email" />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Job Title</mat-label>
                        <mat-icon matPrefix>work</mat-icon>
                        <input matInput formControlName="jobTitle" />
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Department</mat-label>
                        <mat-icon matPrefix>business</mat-icon>
                        <input matInput formControlName="department" />
                      </mat-form-field>
                    </div>

                    <div class="form-actions">
                      <button
                        mat-flat-button
                        color="primary"
                        type="submit"
                        [disabled]="profileForm.invalid || isSavingProfile"
                      >
                        {{ isSavingProfile ? 'Saving…' : 'Save changes' }}
                      </button>
                    </div>
                  </form>
                </div>
              </mat-tab>

              <!-- Preferences Tab -->
              <mat-tab label="Preferences">
                <div class="tab-content">
                  <form [formGroup]="prefsForm" (ngSubmit)="savePreferences()" class="prefs-form">
                    <div class="pref-section">
                      <h3 class="pref-section__title">Appearance</h3>
                      <div class="pref-row">
                        <div class="pref-row__info">
                          <span class="pref-row__label">Theme</span>
                          <span class="pref-row__desc">Choose your preferred color scheme</span>
                        </div>
                        <mat-form-field appearance="outline" class="pref-select">
                          <mat-select formControlName="theme" (selectionChange)="onThemeChange($event.value)">
                            <mat-option value="light">
                              <mat-icon>light_mode</mat-icon> Light
                            </mat-option>
                            <mat-option value="dark">
                              <mat-icon>dark_mode</mat-icon> Dark
                            </mat-option>
                            <mat-option value="system">
                              <mat-icon>contrast</mat-icon> System default
                            </mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>

                      <div class="pref-row">
                        <div class="pref-row__info">
                          <span class="pref-row__label">Dashboard Layout</span>
                          <span class="pref-row__desc">Compact or comfortable spacing</span>
                        </div>
                        <mat-form-field appearance="outline" class="pref-select">
                          <mat-select formControlName="dashboardLayout">
                            <mat-option value="comfortable">Comfortable</mat-option>
                            <mat-option value="compact">Compact</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>

                    <mat-divider class="tf-divider" />

                    <div class="pref-section">
                      <h3 class="pref-section__title">Notifications</h3>

                      @for (notif of notifToggles; track notif.key) {
                        <div class="pref-row pref-row--toggle">
                          <div class="pref-row__info">
                            <span class="pref-row__label">{{ notif.label }}</span>
                            <span class="pref-row__desc">{{ notif.desc }}</span>
                          </div>
                          <mat-slide-toggle
                            [formControlName]="notif.key"
                            color="primary"
                            [attr.aria-label]="notif.label"
                          />
                        </div>
                      }
                    </div>

                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="isSavingPrefs">
                        {{ isSavingPrefs ? 'Saving…' : 'Save preferences' }}
                      </button>
                    </div>
                  </form>
                </div>
              </mat-tab>

              <!-- Security Tab -->
              <mat-tab label="Security">
                <div class="tab-content">
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="profile-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Current Password</mat-label>
                      <mat-icon matPrefix>lock</mat-icon>
                      <input matInput type="password" formControlName="currentPassword" />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>New Password</mat-label>
                      <mat-icon matPrefix>lock_reset</mat-icon>
                      <input matInput type="password" formControlName="newPassword" />
                      @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                        <mat-error>Minimum 8 characters</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Confirm New Password</mat-label>
                      <mat-icon matPrefix>lock_reset</mat-icon>
                      <input matInput type="password" formControlName="confirmPassword" />
                    </mat-form-field>

                    <div class="form-actions">
                      <button mat-flat-button color="primary" type="submit" [disabled]="passwordForm.invalid">
                        Update password
                      </button>
                    </div>
                  </form>

                  <mat-divider class="tf-divider" />

                  <div class="danger-zone">
                    <h3 class="danger-zone__title">Danger Zone</h3>
                    <div class="danger-zone__action">
                      <div>
                        <p class="danger-zone__label">Sign out of all devices</p>
                        <p class="danger-zone__desc">This will revoke all active sessions.</p>
                      </div>
                      <button mat-stroked-button color="warn" (click)="auth.logout()">
                        <mat-icon>logout</mat-icon> Sign out everywhere
                      </button>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);

  isSavingProfile = false;
  isSavingPrefs = false;

  readonly notifToggles = [
    { key: 'taskAssigned', label: 'Task assigned', desc: 'When a task is assigned to you' },
    { key: 'taskDeadline', label: 'Deadline reminder', desc: '24h before a task is due' },
    { key: 'taskComment', label: 'Comments', desc: 'When someone comments on your task' },
    { key: 'taskMention', label: 'Mentions', desc: 'When you are @mentioned' },
    { key: 'teamUpdates', label: 'Team updates', desc: 'Team membership changes' },
    { key: 'emailDigest', label: 'Email digest', desc: 'Weekly summary via email' },
  ];

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    jobTitle: [''],
    department: [''],
  });

  readonly prefsForm = this.fb.nonNullable.group({
    theme: this.fb.nonNullable.control<UserPreferences['theme']>('light'),
    dashboardLayout: this.fb.nonNullable.control<UserPreferences['dashboardLayout']>('comfortable'),
    taskAssigned: [true],
    taskDeadline: [true],
    taskComment: [true],
    taskMention: [true],
    teamUpdates: [true],
    emailDigest: [false],
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.userService.getById(user.id).subscribe((u) => {
      this.profileForm.patchValue({ name: u.name, email: u.email, jobTitle: u.jobTitle, department: u.department });
      this.prefsForm.patchValue({
        theme: u.preferences.theme,
        dashboardLayout: u.preferences.dashboardLayout,
        ...u.preferences.notifications,
      });
    });
  }

  onThemeChange(value: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(value);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.isSavingProfile = true;
    this.userService.update(userId, this.profileForm.getRawValue()).subscribe({
      next: () => { this.toast.success('Profile updated.'); this.isSavingProfile = false; },
      error: () => { this.isSavingProfile = false; },
    });
  }

  savePreferences(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.isSavingPrefs = true;
    const { theme, dashboardLayout, ...notifications } = this.prefsForm.getRawValue();
    this.userService.updatePreferences(userId, { theme, dashboardLayout, notifications }).subscribe({
      next: () => { this.toast.success('Preferences saved.'); this.isSavingPrefs = false; },
      error: () => { this.isSavingPrefs = false; },
    });
  }

  changePassword(): void {
    this.toast.info('Password update is simulated in this demo.');
    this.passwordForm.reset();
  }
}
