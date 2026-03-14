import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true, pure: false })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (seconds < 60)   return 'just now';
    if (minutes < 60)   return `${minutes}m ago`;
    if (hours < 24)     return `${hours}h ago`;
    if (days < 7)       return `${days}d ago`;
    if (weeks < 5)      return `${weeks}w ago`;
    if (months < 12)    return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }
}
