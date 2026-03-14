import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tf-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="rounded ? '9999px' : borderRadius"
      [attr.aria-hidden]="true"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--tf-surface-tertiary) 25%,
        var(--tf-border) 50%,
        var(--tf-surface-tertiary) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
      display: block;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() borderRadius = '6px';
  @Input() rounded = false;
}
