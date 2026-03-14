import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { USER_ROLE_LABELS } from '../../domain/enums/user-role.enum';
import { ROLE_PERMISSIONS } from '../../domain/models/auth.model';

@Component({
  selector: 'tf-settings',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatSlideToggleModule, MatDividerModule,
  ],
  template: `
    <div class="tf-page-container">
      <div class="tf-page-header">
        <div>
          <h1 class="tf-page-title">Settings</h1>
          <p class="tf-page-subtitle">Workspace configuration and access control</p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms">

        <!-- Appearance -->
        <mat-tab label="Appearance">
          <div class="settings-tab">
            <div class="settings-section">
              <h3 class="settings-section__title">Theme</h3>
              <div class="theme-options">
                @for (opt of themeOptions; track opt.value) {
                  <button
                    class="theme-option"
                    [class.theme-option--active]="themeService.theme() === opt.value"
                    (click)="themeService.setTheme(opt.value)"
                    [attr.aria-pressed]="themeService.theme() === opt.value"
                  >
                    <div class="theme-option__preview theme-option__preview--{{ opt.value }}">
                      <mat-icon>{{ opt.icon }}</mat-icon>
                    </div>
                    <span>{{ opt.label }}</span>
                  </button>
                }
              </div>
            </div>

            <mat-divider class="tf-divider" />

            <div class="settings-section">
              <h3 class="settings-section__title">Internationalisation</h3>
              <div class="i18n-info">
                <mat-icon>language</mat-icon>
                <div>
                  <p class="i18n-info__title">Multi-language support (coming soon)</p>
                  <p class="i18n-info__desc">The application is architected with Angular i18n in mind. Translation keys are structured under <code>src/assets/i18n/</code> and the app is ready for <code>@ngx-translate/core</code> integration.</p>
                </div>
              </div>
              <div class="lang-list">
                @for (lang of languages; track lang.code) {
                  <div class="lang-item" [class.lang-item--active]="lang.code === 'en'">
                    <span class="lang-item__flag">{{ lang.flag }}</span>
                    <span class="lang-item__name">{{ lang.name }}</span>
                    @if (lang.code === 'en') {
                      <span class="lang-item__badge">Active</span>
                    } @else {
                      <span class="lang-item__soon">Soon</span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Permissions -->
        <mat-tab label="Permissions">
          <div class="settings-tab">
            <div class="settings-section">
              <h3 class="settings-section__title">Role-Based Access Control</h3>
              <p class="settings-section__desc">
                TeamFlow uses a three-tier RBAC model. Permissions are enforced at route level (guards), service level, and UI level (directives).
              </p>
              <div class="permissions-table">
                <div class="permissions-table__header">
                  <span>Resource</span>
                  @for (role of roles; track role) {
                    <span class="role-col">{{ roleLabels[role] }}</span>
                  }
                </div>
                @for (entry of permissionMatrix; track entry.resource) {
                  <div class="permissions-table__row">
                    <span class="resource-name">{{ entry.resource | titlecase }}</span>
                    @for (role of roles; track role) {
                      <div class="perm-cell">
                        @for (action of entry.actions[role]; track action) {
                          <span class="perm-badge">{{ action }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- About -->
        <mat-tab label="About">
          <div class="settings-tab">
            <div class="about-card tf-card">
              <div class="about-card__logo">
                <mat-icon>workspaces</mat-icon>
              </div>
              <h2 class="about-card__name">TeamFlow</h2>
              <p class="about-card__version">Version 1.0.0</p>
              <p class="about-card__desc">
                A professional SaaS-grade team management platform built with Angular 21, TypeScript, Angular Material, CDK Drag-and-Drop, Chart.js, and a fully reactive architecture using Angular Signals.
              </p>
              <div class="about-stack">
                @for (tech of techStack; track tech.name) {
                  <span class="tech-chip">{{ tech.name }} {{ tech.version }}</span>
                }
              </div>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  readonly auth = inject(AuthService);
  readonly themeService = inject(ThemeService);

  readonly themeOptions = [
    { value: 'light' as const, label: 'Light', icon: 'light_mode' },
    { value: 'dark'  as const, label: 'Dark',  icon: 'dark_mode'  },
    { value: 'system' as const, label: 'System', icon: 'contrast' },
  ];

  readonly languages = [
    { code: 'en', name: 'English',    flag: '🇺🇸' },
    { code: 'pt', name: 'Português',  flag: '🇧🇷' },
    { code: 'es', name: 'Español',    flag: '🇪🇸' },
    { code: 'fr', name: 'Français',   flag: '🇫🇷' },
  ];

  readonly roles = ['admin', 'manager', 'member'] as const;
  readonly roleLabels = USER_ROLE_LABELS as Record<string, string>;

  readonly permissionMatrix = (['tasks','teams','users','reports','settings'] as const).map((resource) => ({
    resource,
    actions: Object.fromEntries(
      (['admin','manager','member'] as const).map((role) => [
        role,
        ROLE_PERMISSIONS[role].find((p) => p.resource === resource)?.actions ?? [],
      ])
    ),
  }));

  readonly techStack = [
    { name: 'Angular',           version: '21' },
    { name: 'TypeScript',        version: '5.9' },
    { name: 'Angular Material',  version: '21' },
    { name: 'Angular CDK',       version: '21' },
    { name: 'Chart.js',          version: '4.5' },
    { name: 'ng2-charts',        version: '10' },
    { name: 'json-server',       version: '0.17' },
    { name: 'RxJS',              version: '7.8' },
  ];
}
