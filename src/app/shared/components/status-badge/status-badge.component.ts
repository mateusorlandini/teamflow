import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TaskStatus, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '../../../domain/enums';

@Component({
  selector: 'tf-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [style.background]="bgColor" [style.color]="textColor">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TaskStatus;

  get label(): string {
    return TASK_STATUS_LABELS[this.status] ?? this.status;
  }

  get bgColor(): string {
    return (TASK_STATUS_COLORS[this.status] ?? '#6b7280') + '22';
  }

  get textColor(): string {
    return TASK_STATUS_COLORS[this.status] ?? '#6b7280';
  }
}
