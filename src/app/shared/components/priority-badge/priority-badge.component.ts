import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TaskPriority, TASK_PRIORITY_COLORS, TASK_PRIORITY_ICONS, TASK_PRIORITY_LABELS } from '../../../domain/enums/task-priority.enum';

@Component({
  selector: 'tf-priority-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span class="priority-badge" [style.color]="color">
      <mat-icon class="priority-badge__icon">{{ icon }}</mat-icon>
      @if (showLabel) {
        <span>{{ label }}</span>
      }
    </span>
  `,
  styles: [`
    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;

      &__icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `],
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: TaskPriority;
  @Input() showLabel = true;

  get label(): string { return TASK_PRIORITY_LABELS[this.priority] ?? this.priority; }
  get color(): string { return TASK_PRIORITY_COLORS[this.priority] ?? '#6b7280'; }
  get icon(): string  { return TASK_PRIORITY_ICONS[this.priority] ?? 'drag_handle'; }
}
