import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'tf_theme';
  private readonly _theme = signal<ThemeMode>(this.loadTheme());

  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  setTheme(mode: ThemeMode): void {
    this._theme.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  toggleDarkMode(): void {
    const current = this._theme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  isDarkActive(): boolean {
    const theme = this._theme();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }

  private applyTheme(mode: ThemeMode): void {
    const body = document.body;
    const isDark =
      mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    body.classList.toggle('dark-theme', isDark);
  }

  private loadTheme(): ThemeMode {
    return (localStorage.getItem(this.STORAGE_KEY) as ThemeMode) ?? 'light';
  }
}
