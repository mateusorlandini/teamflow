import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'tf-avatar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  template: `
    <div
      class="avatar"
      [class]="'avatar--' + size"
      [matTooltip]="tooltip || ''"
      [attr.aria-label]="tooltip"
    >
      @if (src) {
        <img class="avatar__img" [src]="src" [alt]="name || ''" loading="lazy" />
      } @else {
        <span class="avatar__initials" [style.background]="color">
          {{ initials }}
        </span>
      }
      @if (showStatus) {
        <span class="avatar__status" [class]="'avatar__status--' + status"></span>
      }
    </div>
  `,
  styles: [`
    .avatar {
      position: relative;
      display: inline-flex;
      flex-shrink: 0;

      &--xs { width: 24px; height: 24px; }
      &--sm { width: 32px; height: 32px; }
      &--md { width: 40px; height: 40px; }
      &--lg { width: 48px; height: 48px; }
      &--xl { width: 64px; height: 64px; }

      &__img, &__initials {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      &__initials {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: #fff;
        font-size: 0.4em;
        background: var(--tf-primary-500);
        font-size: inherit;
      }

      &--xs .avatar__initials { font-size: 9px; }
      &--sm .avatar__initials { font-size: 12px; }
      &--md .avatar__initials { font-size: 14px; }
      &--lg .avatar__initials { font-size: 17px; }
      &--xl .avatar__initials { font-size: 22px; }

      &__status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--tf-surface);
        &--online  { background: var(--tf-success-500); }
        &--away    { background: var(--tf-warning-500); }
        &--offline { background: var(--tf-text-muted); }
      }
    }
  `],
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name?: string;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color = 'var(--tf-primary-500)';
  @Input() tooltip?: string;
  @Input() showStatus = false;
  @Input() status: 'online' | 'away' | 'offline' = 'offline';

  get initials(): string {
    if (!this.name) return '?';
    return this.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
