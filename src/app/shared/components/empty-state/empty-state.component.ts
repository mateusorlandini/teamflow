import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'tf-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__description">{{ description }}</p>
      @if (actionLabel) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          <mat-icon>{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      gap: 8px;

      &__icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: var(--tf-surface-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--tf-text-muted);
        }
      }

      &__title {
        font-size: 16px;
        font-weight: 600;
        color: var(--tf-text-primary);
        margin: 0;
      }

      &__description {
        font-size: 13px;
        color: var(--tf-text-secondary);
        margin: 0 0 16px;
        max-width: 320px;
      }
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description = 'Get started by creating your first item.';
  @Input() actionLabel?: string;
  @Input() actionIcon = 'add';
  @Output() action = new EventEmitter<void>();
}
